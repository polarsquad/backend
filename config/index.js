const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const booleanEnvVar = (env_variable, default_value) => (
    env_variable 
        ? env_variable === "true"
        : default_value
)

exports.config = {
    title:                        process.env.TITLE || "--title",
    translationSpreadsheetUrl:    process.env.TRANSLATION_SPREADSHEET_URL || "--translation-spreadsheet-URL",
    googleTranslateApiKey:        process.env.GOOGLE_TRANSLATE_API_KEY || "--google-translate-api-key",
    deepLApiKey:                  process.env.DEEP_L_API_KEY || "--deepL-api-key",
    frontendUrl:                  process.env.FRONTEND_URL || "--frontend-URL",
    port:                         process.env.PRODUCTION_API_PORT || "--production-api-port",
    mail: {
        host:     process.env.MAIL_HOST || "--mail-host",
        port:     process.env.MAIL_PORT || "--mail-port",
        secure:   booleanEnvVar(process.env.MAIL_IS_SECURE, true),
        user:     process.env.MAIL_USER || "--mail-user",
        pass:     process.env.MAIL_PASSWORD || "--mail-pass",
        from:     process.env.MAIL_FROM_ADDRESS || "--mail-from"
    },
    db: {
        host:             process.env.DB_HOST || "--db-host",
        port:             process.env.DB_PORT || "--db-port",
        name:             process.env.DB_NAME || "--db-name",
        credentials: {
            username:     process.env.DB_USERNAME || "--db-username",
            password:     process.env.DB_PASSWORD || "--db-password"
        }
    },
    publicApi:{
        port: process.env.PUBLIC_API_PORT || "--public-api-port"
    },
    adminMail: process.env.ADMIN_MAIL || "--admin-mail",
    voiceReader:{
        properties:   [ "title", "brief", "description"],
        baseUrl:      process.env.VOICE_READER_BASE_URL || "--voiceReader-baseUrl",
        customerId:   process.env.VOICE_READER_CUSTOMER_ID || "--voiceReader-customerId"
    },
    suggestions:{
        apiKey:           process.env.SUGGESTIONS_API_KEY || "--suggestion-api-key",
        requireMail:      booleanEnvVar(process.env.SUGGESTIONS_REQUIRE_MAIL, true),
        requireApiKey:    process.env.SUGGESTIONS_REQUIRE_API_KEY || "new",
        requireName:      booleanEnvVar(process.env.SUGGESTIONS_REQUIRE_NAME, true),
        sendConfirmation: booleanEnvVar(process.env.SUGGESTIONS_SEND_CONFIRMATION, true)
    }
}
