
package com.nostalgi.snap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.*; 
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region; 
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.*;
import java.io.IOException;
import java.net.URI; 
import java.nio.file.*; 
import java.util.Optional;

@Service
public class SnapshotService {
  private final Path root;
  private final boolean s3Enabled; private final Optional<S3Client> s3Client; private final String bucket;

  public SnapshotService(
    @Value("${snap.storageDir:./data/snapshots}") String storageDir,
    @Value("${snap.s3.enabled:false}") boolean s3Enabled,
    @Value("${snap.s3.bucket:nostalgios-snaps}") String bucket,
    @Value("${snap.s3.region:ap-south-1}") String region,
    @Value("${snap.s3.endpoint:}") String endpoint,
    @Value("${snap.s3.forcePathStyle:true}") boolean forcePathStyle,
    @Value("${aws.accessKeyId:}") String access,
    @Value("${aws.secretAccessKey:}") String secret
  ) throws IOException {
    this.root = Paths.get(storageDir); Files.createDirectories(this.root);
    this.s3Enabled = s3Enabled; this.bucket = bucket;
    if (s3Enabled) {
      S3ClientBuilder b = S3Client.builder().region(Region.of(region));
      if (!endpoint.isBlank()) b = b.endpointOverride(URI.create(endpoint));
      if (!access.isBlank() && !secret.isBlank()) b = b.credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(access, secret)));
      if (forcePathStyle) b = b.forcePathStyle(true);
      S3Client c = b.build();
      this.s3Client = Optional.of(c);
      try { c.headBucket(h->h.bucket(bucket)); } catch(Exception e){ c.createBucket(cb->cb.bucket(bucket)); }
    } else this.s3Client = Optional.empty();
  }

  public void store(String deviceId, byte[] data) throws IOException {
    if (s3Enabled) {
      s3Client.get().putObject(PutObjectRequest.builder().bucket(bucket).key(deviceId + ".bin").build(), RequestBody.fromBytes(data));
    } else {
      Files.write(root.resolve(deviceId + ".bin"), data, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }
  }
  public byte[] fetch(String deviceId) throws IOException {
    if (s3Enabled) {
      try { var resp = s3Client.get().getObject(GetObjectRequest.builder().bucket(bucket).key(deviceId + ".bin").build()); return resp.readAllBytes(); }
      catch (NoSuchKeyException e){ return null; }
      catch (Exception e){ return null; }
    } else {
      Path p=root.resolve(deviceId + ".bin"); return Files.exists(p)? Files.readAllBytes(p) : null;
    }
  }
  public boolean delete(String deviceId) throws IOException {
    if (s3Enabled) {
      try { s3Client.get().deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(deviceId + ".bin").build()); return true; } catch(Exception e){ return false; }
    } else {
      Path p=root.resolve(deviceId + ".bin"); if(!Files.exists(p)) return false; Files.delete(p); return true;
    }
  }
}
