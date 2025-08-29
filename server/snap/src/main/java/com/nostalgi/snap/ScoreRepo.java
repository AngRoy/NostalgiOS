
package com.nostalgi.snap;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ScoreRepo extends JpaRepository<Score, Long> { List<Score> findTop50ByGameIdOrderByScoreDesc(String gameId); }
