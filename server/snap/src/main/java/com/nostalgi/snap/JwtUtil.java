
package com.nostalgi.snap;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
import java.security.Key; import java.util.Date;
@Component
public class JwtUtil {
  private final Key key; private final long ttl;
  public JwtUtil(@Value("${snap.jwt.secret:dev-secret-change-me}") String secret, @Value("${snap.jwt.ttlSeconds:86400}") long ttlSeconds){
    this.key = Keys.hmacShaKeyFor(secret.getBytes()); this.ttl = ttlSeconds*1000L;
  }
  public String create(String username){ long now=System.currentTimeMillis(); return Jwts.builder().setSubject(username).setIssuedAt(new Date(now)).setExpiration(new Date(now+ttl)).signWith(key, SignatureAlgorithm.HS256).compact(); }
  public String validate(String token){ try{ Jws<Claims> jws = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); return jws.getBody().getSubject(); } catch(Exception e){ return null; } }
}
