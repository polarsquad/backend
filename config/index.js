require('dotenv').config({
    path: "../.env"
})

const booleanEnvVar = (env_variable, default_value) => (
    env_variable 
        ? env_variable === "true"
        : default_value
)

exports.config = {
    title:                        process.env.TITLE || "--title",
    translationSpreadsheetUrl:    process.env.TRANSLATION_SPREADSHEET_URL || "--translationSpreadsheetUrl",
    googleTranslateApiKey:        process.env.GOOGLE_TRANSLATE_API_KEY || "--googleTranslateApiKey",
    deepLApiKey:                  process.env.DEEP_L_API_KEY || "--deepLApiKey",
    frontendUrl:                  process.env.FRONTEND_URL || "--frontendUrl",
    port:                         process.env.API_PORT || "2413",
    mail: {
        "host":     process.env.MAIL_HOST || "--mail-host",
        "port":     process.env.MAIL_PORT || "--mail-port",
        "secure":   booleanEnvVar(process.env.MAIL_IS_SECURE, true),
        "user":     process.env.MAIL_USER || "--mail-user",
        "pass":     process.env.MAIL_PASSWORD || "--mail-pass",
        "from":     process.env.MAIL_FROM_ADDRESS || "--mail-from"
    },
    db: {
        "host":             process.env.DB_HOST || "localhost",
        "port":             process.env.DB_PORT || "27017",
        "name":             process.env.DB_NAME || "deployd",
        "credentials": {
            "username":     process.env.DB_USERNAME || "patrickds",
            "password":     process.env.DB_PASSWORD || "test1234"
        }
    },
    publicApi:{
        "port": process.env.PUBLIC_API_PORT || 3003
    },
    adminMail: process.env.ADMIN_MAIL || "--adminMail",
    voiceReader:{
        "properties":   [ "title", "brief", "description"],
        "baseUrl":      process.env.VOICE_READER_BASE_URL || "--voiceReader-baseUrl",
        "customerId":   process.env.VOICE_READER_CUSTOMER_ID || "--voiceReader-customerId"
    },
    suggestions:{
        "apiKey":           process.env.SUGGESTIONS_API_KEY || "--suggestion-apiKey",
        "requireMail":      booleanEnvVar(process.env.SUGGESTIONS_REQUIRE_MAIL, true),
        "requireApiKey":    process.env.SUGGESTIONS_REQUIRE_API_KEY || "new",
        "requireName":      booleanEnvVar(process.env.SUGGESTIONS_REQUIRE_NAME, true),
        "sendConfirmation": booleanEnvVar(process.env.SUGGESTIONS_SEND_CONFIRMATION, true)
    }
}
