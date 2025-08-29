
package com.nostalgi.snap;
import org.springframework.http.ResponseEntity; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final UserRepo users; private final PasswordEncoder enc; private final JwtUtil jwt;
  public AuthController(UserRepo users, PasswordEncoder enc, JwtUtil jwt){ this.users=users; this.enc=enc; this.jwt=jwt; }
  @PostMapping("/register") public ResponseEntity<?> register(@RequestBody Map<String,String> body){
    String u = body.getOrDefault("username","").trim(); String p = body.getOrDefault("password","");
    if(u.isEmpty()||p.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","missing credentials"));
    if(users.findByUsername(u).isPresent()) return ResponseEntity.badRequest().body(Map.of("error","exists"));
    users.save(new User(u, enc.encode(p))); return ResponseEntity.ok(Map.of("ok",true));
  }
  @PostMapping("/login") public ResponseEntity<?> login(@RequestBody Map<String,String> body){
    String u = body.getOrDefault("username",""); String p = body.getOrDefault("password","");
    var user = users.findByUsername(u).orElse(null); if(user==null) return ResponseEntity.status(401).body(Map.of("error","bad creds"));
    if(!enc.matches(p, user.getPasswordHash())) return ResponseEntity.status(401).body(Map.of("error","bad creds"));
    return ResponseEntity.ok(Map.of("token", jwt.create(u)));
  }
}
