package com.DailyCodeBuffer.projectforjpa_Tutorial.Repository;

import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Guardian;
import com.DailyCodeBuffer.projectforjpa_Tutorial.Entity.Student;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class StudentRepositoryTest {
    @Autowired
    private StudentRepository studentRepository;
    @Test
    public void saveStudent() {
        // Create a new Student instance
        Student student = Student.builder()
                .emailId("ra@gmail.com")
                .firstName("John")
                .lastName("Doe").build();//guardianName("ram").guardianEmail("ram@gmail.com").guardianMobile("9925090")
        // Save the student
        studentRepository.save(student);
    }
    @Test
    public void saveStudentWithGuardian(){
        Guardian guardian=Guardian.builder().email("raam@gmail.com").mobile("9922590").name("ram").build();

        Student student= Student.builder().firstName("rutik").lastName("Shel").emailId("Rutik1@gmail.com").guardian(guardian).build();
        studentRepository.save(student);

    }
    @Test
    public void printAllStudent(){
        List<Student>studentList = studentRepository.findAll();
        System.out.println("student list :"+studentList);

    }
    @Test
    public void printStudentByFirstName(){
        List<Student>studentList=studentRepository.findByFirstName("John") ;
        System.out.println(studentList);
    }
    @Test
    public void printStudentByNameContaining(){
        List<Student>studentList=studentRepository.findByFirstNameContaining("Jo") ;
        System.out.println(studentList);
    }
    @Test
    public void printBasedOnGuardians(){
        List<Student> students =studentRepository.findByGuardianName("ram") ;
        System.out.println(students);}
        @Test
        public void printByLastNameNotNull(){
            List<Student> student =studentRepository.findByLastNameNotNull() ;
            System.out.println(student);
        }
        @Test
    public void getStudentByEmailAddress(){
        Student student =studentRepository.getStudentByEmailAddress("Rutik1@gmail.com") ;
            System.out.println(student);
        }
    @Test
    public void getFirstNameByEmailAddress(){
       String firstName=studentRepository.getFirstNameByEmailAddress("Rutik1@gmail.com") ;
        System.out.println(firstName);
    }
    @Test
    public void getFirstNameByEmailAddressNative(){
        Student student =studentRepository.getFirstNameByEmailAddressNative("Rutik1@gmail.com") ;
        System.out.println(student);
    }
    @Test
    public void getFirstNameByEmailAddressNativeNamedParam(){
        Student student =studentRepository.getFirstNameByEmailAddressNativeNamedParam("Rutik1@gmail.com") ;
        System.out.println(student);
    }
    @Test
    public void updateStudentFirstNameByEmailId(){
     studentRepository.updateStudentFirstNameBYEmailId("Jonty","ra@gmail.com");
    }
    }

