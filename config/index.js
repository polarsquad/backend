const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const booleanEnvVar = (env_variable, default_value) => (
    env_variable 
        ? env_variable === "true"
        : default_value
)

exports.config = {
    title:                        process.env.TITLE,
    translationSpreadsheetUrl:    process.env.TRANSLATION_SPREADSHEET_URL,
    googleTranslateApiKey:        process.env.GOOGLE_TRANSLATE_API_KEY,
    deepLApiKey:                  process.env.DEEP_L_API_KEY,
    frontendUrl:                  process.env.FRONTEND_URL,
    port:                         process.env.PRODUCTION_API_PORT,
    mail: {
        host:     process.env.MAIL_HOST,
        port:     process.env.MAIL_PORT,
        secure:   booleanEnvVar(process.env.MAIL_IS_SECURE, true),
        user:     process.env.MAIL_USER,
        pass:     process.env.MAIL_PASSWORD,
        from:     process.env.MAIL_FROM_ADDRESS
    },
    db: {
        host:             process.env.DB_HOST,
        port:             process.env.DB_PORT,
        name:             process.env.DB_NAME,
        credentials: {
            username:     process.env.DB_USERNAME,
            password:     process.env.DB_PASSWORD
        }
    },
    publicApi:{
        port: process.env.PUBLIC_API_PORT
    },
    adminMail: process.env.ADMIN_MAIL,
    voiceReader:{
        properties:   [ "title", "brief", "description"],
        baseUrl:      process.env.VOICE_READER_BASE_URL,
        customerId:   process.env.VOICE_READER_CUSTOMER_ID
    },
    suggestions:{
        apiKey:           process.env.SUGGESTIONS_API_KEY,
        requireMail:      booleanEnvVar(process.env.SUGGESTIONS_REQUIRE_MAIL, true),
        requireApiKey:    process.env.SUGGESTIONS_REQUIRE_API_KEY,
        requireName:      booleanEnvVar(process.env.SUGGESTIONS_REQUIRE_NAME, true),
        sendConfirmation: booleanEnvVar(process.env.SUGGESTIONS_SEND_CONFIRMATION, true)
    }
}
