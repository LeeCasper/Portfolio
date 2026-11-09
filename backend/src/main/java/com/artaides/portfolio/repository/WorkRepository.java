package com.artaides.portfolio.repository;

import com.artaides.portfolio.entity.Work;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkRepository extends JpaRepository<Work, Long> {
    List<Work> findAllByOrderBySortOrderAsc();
    List<Work> findByIsShowTrueOrderBySortOrderAsc();
}
