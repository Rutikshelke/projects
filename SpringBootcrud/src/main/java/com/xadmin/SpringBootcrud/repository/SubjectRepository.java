package com.xadmin.SpringBootcrud.repository;

import com.xadmin.SpringBootcrud.bean.Subject;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface  SubjectRepository extends CrudRepository<Subject,String> {

}
