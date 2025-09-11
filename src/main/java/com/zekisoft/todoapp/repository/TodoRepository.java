package com.zekisoft.todoapp.repository;

import com.zekisoft.todoapp.mapper.TodoMapper;
import com.zekisoft.todoapp.model.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class TodoRepository {
    
    @Autowired
    private TodoMapper todoMapper;
    
    public List<Todo> findAllByOrderByCreatedAtDesc() {
        return todoMapper.findAllByOrderByCreatedAtDesc();
    }
    
    public Todo save(Todo todo) {
        if (todo.getId() == null) {
            // Insert new todo
            todoMapper.insertTodo(todo);
            return todo;
        } else {
            // Update existing todo
            todoMapper.updateTodo(todo);
            return todo;
        }
    }
    
    public Todo findById(Long id) {
        return todoMapper.findById(id);
    }
    
    public boolean logicalDelete(Long id) {
        int result = todoMapper.logicalDeleteTodo(id, LocalDateTime.now());
        return result > 0;
    }
}