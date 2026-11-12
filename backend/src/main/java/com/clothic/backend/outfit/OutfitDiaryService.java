package com.clothic.backend.outfit;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OutfitDiaryService {
    private final OutfitWriter writer;
    private final OutfitRepository repository;

    public OutfitDiaryService(OutfitWriter writer, OutfitRepository repository) {
        this.writer = writer;
        this.repository = repository;
    }

    @Transactional
    public OutfitResponse update(UUID userId, UUID outfitId, OutfitDiaryPatch patch) {
        // UPDATE의 행 잠금은 이 트랜잭션이 확인한 결과를 읽을 때까지 유지된다.
        if (writer.updateDiary(userId, outfitId, patch) != 1) throw notFound();
        return repository.findOwnedById(userId, outfitId).orElseThrow(OutfitDiaryService::notFound);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "outfit not found");
    }
}
