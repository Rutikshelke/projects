package net.javaguides.springboot.model;
import jakarta.persistence.*;
import  lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name="employee")
@Entity
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id ;
    @Column(name = "first_name",nullable = false )
    private  String firstName;
    @Column(name = "last_name")
    private  String  lastName;
    @Column(name = "email_id")
    private  String email ;

}
