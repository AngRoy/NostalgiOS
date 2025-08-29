
package com.nostalgi.snap;
import jakarta.persistence.*; 
@Entity @Table(name="users")
public class User {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
  @Column(unique=true, nullable=false) String username;
  @Column(nullable=false) String passwordHash;
  String roles = "USER";
  public User() {}
  public User(String u, String ph){ this.username=u; this.passwordHash=ph; }
  public Long getId(){ return id; } public String getUsername(){ return username; } public String getPasswordHash(){ return passwordHash; } public String getRoles(){ return roles; }
}
