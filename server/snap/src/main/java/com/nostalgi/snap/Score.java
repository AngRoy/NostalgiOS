
package com.nostalgi.snap;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="scores", indexes = { @Index(columnList="gameId,score") })
public class Score {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
  String gameId; String player; int score; Instant createdAt = Instant.now();
  public Score() {} public Score(String gameId, String player, int score){ this.gameId=gameId; this.player=player; this.score=score; }
  public Long getId(){ return id; } public String getGameId(){ return gameId; } public String getPlayer(){ return player; } public int getScore(){ return score; } public Instant getCreatedAt(){ return createdAt; }
}
