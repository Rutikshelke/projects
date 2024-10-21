package net.javaguides.springboot;

import net.javaguides.springboot.model.Employee;
import net.javaguides.springboot.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringbootBackendApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(SpringbootBackendApplication.class, args);
	}
@Autowired
private EmployeeRepository employeeRepository;
	@Override
	public void run(String... args) throws Exception {
		Employee employee = new Employee() ;
  employee.setFirstName("ramesh");
  employee.setLastName("fadtare");
  employee.setEmail("ramesh@gmail.com");
  employeeRepository.save(employee	);
		Employee employee1 = new Employee() ;
		employee1.setFirstName("ratan");
		employee1.setLastName("fade");
		employee1.setEmail("ratan@gmail.com");
		employeeRepository.save(employee1);

		Employee employee2 = new Employee() ;
		employee2.setFirstName("geeta");
		employee2.setLastName("govinda");
		employee2.setEmail("geeta@gmail.com");
		employeeRepository.save(employee2);


	}
}
