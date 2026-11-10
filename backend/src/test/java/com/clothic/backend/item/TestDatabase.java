package com.clothic.backend.item;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.stream.Stream;

import javax.sql.DataSource;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

/**
 * 테스트 전용 임베디드 PostgreSQL 17. 저장소의 Supabase migration SQL을 그대로 적용해 실제 스키마와 RLS 정책을 만든다.
 * 운영 데이터베이스에는 절대 연결하지 않는다.
 */
public final class TestDatabase {

    public static final String BACKEND_ROLE = "clothic_backend";
    public static final String BACKEND_PASSWORD = "clothic_backend_test";
    static final String PROBE_ROLE = "clothic_rls_probe";
    static final String PROBE_PASSWORD = "clothic_rls_probe_test";

    private static final Path MIGRATIONS = Path.of("..", "supabase", "migrations");
    private static final Path TEST_SQL = Path.of("src", "test", "resources", "db");

    private static EmbeddedPostgres postgres;

    private TestDatabase() {
    }

    static synchronized EmbeddedPostgres start() {
        if (postgres == null) {
            try {
                postgres = EmbeddedPostgres.builder().start();
                apply(postgres.getPostgresDatabase(), TEST_SQL.resolve("00-auth-stub.sql"));
                for (Path migration : sortedSqlFiles(MIGRATIONS)) {
                    apply(postgres.getPostgresDatabase(), migration);
                }
                apply(postgres.getPostgresDatabase(), TEST_SQL.resolve("99-grants.sql"));
                Runtime.getRuntime().addShutdownHook(new Thread(TestDatabase::stop));
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
        return postgres;
    }

    public static String jdbcUrl(String role, String password) {
        return start().getJdbcUrl(role, "postgres") + "&password=" + password;
    }

    public static DataSource superuser() {
        return start().getPostgresDatabase();
    }

    static List<Path> sortedSqlFiles(Path directory) throws IOException {
        try (Stream<Path> files = Files.list(directory)) {
            return files.filter(path -> path.toString().endsWith(".sql")).sorted().toList();
        }
    }

    private static void apply(DataSource dataSource, Path sqlFile) throws IOException {
        String sql = Files.readString(sqlFile);
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute(sql);
        } catch (SQLException e) {
            throw new IllegalStateException("failed to apply " + sqlFile + ": " + e.getMessage(), e);
        }
    }

    private static synchronized void stop() {
        if (postgres != null) {
            try {
                postgres.close();
            } catch (IOException ignored) {
                // 종료 중 오류는 테스트 결과에 영향을 주지 않는다.
            }
            postgres = null;
        }
    }
}
