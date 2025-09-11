package com.zekisoft.todoapp.controller;

import com.zekisoft.todoapp.model.Todo;
import com.zekisoft.todoapp.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    @GetMapping
    public List<Todo> getAllTodos() {
        return todoRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<Todo> addTodo(@RequestBody Todo todo) {
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String title = todo.getTitle().trim();
        if (title.length() > 20) {
            return ResponseEntity.badRequest().build();
        }

        Todo newTodo = new Todo(title);
        Todo savedTodo = todoRepository.save(newTodo);
        
        return ResponseEntity.ok(savedTodo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String title = todo.getTitle().trim();
        if (title.length() > 20) {
            return ResponseEntity.badRequest().build();
        }
        
        Todo existingTodo = todoRepository.findById(id);
        if (existingTodo == null) {
            return ResponseEntity.notFound().build();
        }
        
        existingTodo.setTitle(title);
        Todo updatedTodo = todoRepository.save(existingTodo);
        
        return ResponseEntity.ok(updatedTodo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        Todo existingTodo = todoRepository.findById(id);
        if (existingTodo == null) {
            return ResponseEntity.notFound().build();
        }
        
        boolean deleted = todoRepository.logicalDelete(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.internalServerError().build();
        }
    }
}