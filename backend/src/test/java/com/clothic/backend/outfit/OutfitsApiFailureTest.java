package com.clothic.backend.outfit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.clothic.backend.auth.TestTokens;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;

/**
 * 데이터베이스 조회 실패는 500으로 끝나고, 오류 응답에 SQL·접속 정보가 들어가지 않는지 확인한다. DB 설정 없이도 서버가 기동하는지 함께 확인한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + OutfitsApiTest.SECRET,
})
class OutfitsApiFailureTest {

    private static final String SECRET_DETAIL = "FATAL: password authentication failed for user \"clothic_backend\" select * from outfits";

    @LocalServerPort
    private int port;

    @MockitoBean
    private OutfitQueryService service;

    @Test
    void databaseFailureIsAnOpaqueServerError() throws Exception {
        when(service.findOwnedOutfits(any())).thenThrow(new DataAccessResourceFailureException(SECRET_DETAIL));
        String token = TestTokens.sign(new MACSigner(OutfitsApiTest.SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().build());

        HttpResponse<String> response = TestTokens.get(port, "/api/outfits", token);

        assertEquals(500, response.statusCode());
        assertFalse(response.body().contains("select"));
        assertFalse(response.body().contains("clothic_backend"));
        assertFalse(response.body().contains("password"));
    }

    @Test
    void detailDatabaseFailureIsNotReportedAsMissingOrLeaked() throws Exception {
        when(service.findOwnedOutfit(any(), any())).thenThrow(new DataAccessResourceFailureException(SECRET_DETAIL));
        String token = TestTokens.sign(new MACSigner(OutfitsApiTest.SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().build());
        var response = TestTokens.get(port, "/api/outfits/8aaaaaaa-0000-4000-8000-000000000003", token);
        assertEquals(500, response.statusCode());
        assertFalse(response.body().contains("select"));
        assertFalse(response.body().contains("clothic_backend"));
        assertFalse(response.body().contains("password"));
    }
}
