
package com.nostalgi.snap;
import jakarta.servlet.*; import jakarta.servlet.http.*; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component; import java.io.IOException; import java.util.List;
@Component
public class JwtFilter implements Filter {
  private final JwtUtil jwt; private final UserRepo users;
  public JwtFilter(JwtUtil jwt, UserRepo users){ this.jwt=jwt; this.users=users; }
  @Override public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
    HttpServletRequest r = (HttpServletRequest)req;
    String h = r.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")){
      String sub = jwt.validate(h.substring(7));
      if (sub != null){
        var user = users.findByUsername(sub).orElse(null);
        if (user != null){
          var auth = new UsernamePasswordAuthenticationToken(sub, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      }
    }
    chain.doFilter(req, res);
  }
}
