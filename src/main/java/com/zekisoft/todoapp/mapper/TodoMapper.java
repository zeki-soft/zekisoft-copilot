package com.zekisoft.todoapp.mapper;

import com.zekisoft.todoapp.model.Todo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TodoMapper {
    List<Todo> findAllByOrderByCreatedAtDesc();
    
    int insertTodo(Todo todo);
    
    int updateTodo(Todo todo);
    
    Todo findById(@Param("id") Long id);
    
    int logicalDeleteTodo(@Param("id") Long id, @Param("updatedAt") LocalDateTime updatedAt);
}