package com.xadmin.SpringBootcrud.bean;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name ="Subject")
public class Subject {
    public Subject(String id,String name) {
        this.id = id;
        this.name=name ;
    }
    public Subject(){

    }

    @Id

    private  String id;
    private  String name;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
