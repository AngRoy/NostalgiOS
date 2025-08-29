
package com.nostalgi.snap;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiControllers {
  private final SnapshotService snaps;
  private final ScoreRepo scores;

  public ApiControllers(SnapshotService snaps, ScoreRepo scores) {
    this.snaps = snaps;
    this.scores = scores;
  }

  private boolean isAuthed(Authentication auth) {
    return auth != null && auth.isAuthenticated();
  }

  @PostMapping("/snapshots/{deviceId}")
  public ResponseEntity<?> putSnapshot(@PathVariable String deviceId, @RequestBody byte[] data, Authentication auth)
      throws IOException {
    if (!isAuthed(auth))
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    snaps.store(deviceId, data);
    return ResponseEntity.ok().build();
  }

  @GetMapping(value = "/snapshots/{deviceId}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public ResponseEntity<byte[]> getSnapshot(@PathVariable String deviceId, Authentication auth) throws IOException {
    if (!isAuthed(auth))
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    byte[] data = snaps.fetch(deviceId);
    if (data == null)
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    return ResponseEntity.ok(data);
  }

  @DeleteMapping("/snapshots/{deviceId}")
  public ResponseEntity<?> deleteSnapshot(@PathVariable String deviceId, Authentication auth) throws IOException {
    if (!isAuthed(auth))
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    return snaps.delete(deviceId) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

  @PostMapping("/leaderboard/{gameId}")
  public ResponseEntity<?> postScore(@PathVariable String gameId, @RequestBody Map<String, Object> body) {
    String player = String.valueOf(body.getOrDefault("player", "anon"));
    int score = ((Number) body.getOrDefault("score", 0)).intValue();
    scores.save(new Score(gameId, player, score));
    return ResponseEntity.ok().build();
  }

  @GetMapping("/leaderboard/{gameId}")
  public List<Score> top(@PathVariable String gameId) {
    return scores.findTop50ByGameIdOrderByScoreDesc(gameId);
  }

  @GetMapping("/api/ping")
  public Map<String, String> ping() {
    return Map.of("status", "ok");
  }
}
