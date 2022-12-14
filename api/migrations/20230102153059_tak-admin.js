function up(knex) {
    return knex.schema.raw(`
        CREATE TABLE server (
            id          BIGSERIAL PRIMARY KEY,
            created     TIMESTAMP NOT NULL DEFAULT Now(),
            updated     TIMESTAMP NOT NULL DEFAULT Now(),
            name        TEXT NOT NULL DEFAULT 'Default',
            url         TEXT NOT NULL,
            auth        JSONB NOT NULL DEFAULT '{}'::JSONB
        )
    `);
}

function down(knex) {
    return knex.schema.raw(``);
}

export {
    up,
    down
}
