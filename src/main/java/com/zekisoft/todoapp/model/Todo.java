package com.zekisoft.todoapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "todo")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false, length = 20)
    private String title;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Todo() {
    }

    public Todo(String title) {
        this.title = title;
        this.createdAt = LocalDateTime.now();
    }

    public Todo(Long id, String title) {
        this.id = id;
        this.title = title;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}