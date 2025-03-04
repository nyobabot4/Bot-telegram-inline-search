var token = "7849305390:AAHsD9O-IhGyLnCJPxOoIg1a_acn5spNOFA"; // GANTI dengan token bot kamu
const tg = new telegram.daftar(token);
const adminBot = 2109541199; // GANTI dengan ID admin kamu
const spreadsheetId = "10TupgRfroPas2SjNNY19Q4uB82AYGUVwIIisBxb9Mgg"; // GANTI dengan ID Spreadsheet kamu!
const debug = false; // Biarkan false, kecuali kamu perlu debug lebih lanjut

// --- Fungsi-fungsi Telegram (dari code.gs kamu) ---
function getMe() {
    let me = tg.getMe();
    Logger.log("getMe: " + JSON.stringify(me)); // Log hasil getMe
    return me;
}

function setWebhook() {
    var url = "YOUR_WEB_APP_URL"; // GANTI dengan URL Web App kamu setelah deploy!
    var r = tg.setWebhook(url);
    Logger.log("setWebhook: " + r); // Log hasil setWebhook
    return r;
}

function getWebhookInfo() {
    let hasil = tg.getWebhookInfo();
    Logger.log("getWebhookInfo: " + JSON.stringify(hasil)); // Log hasil getWebhookInfo
    return hasil;
}

function deleteWebhook() {
    let hasil = tg.deleteWebhook();
    Logger.log("deleteWebhook: " + hasil); // Log hasil deleteWebhook
    return hasil;
}

// --- Fungsi utama (doPost) ---
function doPost(e) {
    try { // Tambahkan try-catch di seluruh doPost
        if (debug) {
            tg.sendMessage(adminBot, JSON.stringify(e, null, 2));
        }

        let update = JSON.parse(e.postData.contents);

        Logger.log("doPost dijalankan!");
        Logger.log("Update yang diterima: " + JSON.stringify(update, null, 2));

        // Handle inline queries
        if (update.inline_query) {
            handleInlineQuery(update.inline_query);
            return;
        }

        // Handle callback queries (dari tombol)
        if (update.callback_query) {
            handleCallbackQuery(update.callback_query);
            return;
        }

        // Handle pesan biasa
        if (update.message) {
            let msg = update.message;
            Logger.log("Pesan diterima: " + JSON.stringify(msg, null, 2)); // Log pesan

            // Cek apakah dari admin
            if (msg.from.id == adminBot) {
                if (msg.text == "/start") {
                    startCommand(msg);
                } else if (msg.forward_from || msg.forward_from_chat || msg.photo || msg.document) {
                    saveForwardedMessage(msg);
                } else {
                    tg.sendMessage(adminBot, "Perintah tidak dikenali atau tidak ada file/forward yang diproses.");
                }
            } else {
                // Pesan dari non-admin
                tg.sendMessage(msg.chat.id, "Maaf, saya hanya merespons perintah dari admin.");
            }
        }
    } catch (error) {
        Logger.log("Error di doPost: " + error.message);
        Logger.log("Stack trace: " + error.stack);
        tg.sendMessage(adminBot, "Terjadi error: " + error.message); // Kirim error ke admin
    }
}

// --- Handler Commands dan Callbacks ---

function startCommand(msg) {
    let keyboard = [
        [{ text: "Cari File", switch_inline_query_current_chat: "" }],
        [{ text: "Bantuan", callback_data: "help" }],
    ];
    sendMsgKeyboardInline(msg, "Selamat datang! Gunakan tombol di bawah untuk mencari file atau mendapatkan bantuan.", keyboard);
}

function handleInlineQuery(inlineQuery) {
    try { // Tambahkan try-catch
        let query = inlineQuery.query;
        Logger.log("handleInlineQuery - Query: " + query); // Log query

        let results = searchFiles(query);
        Logger.log("handleInlineQuery - Hasil: " + JSON.stringify(results)); // Log hasil

        let response = {
            inline_query_id: inlineQuery.id,
            results: JSON.stringify(results),
            cache_time: 10,
        };

        tg.request("answerInlineQuery", response);
    } catch (error) {
        Logger.log("Error di handleInlineQuery: " + error.message);
        Logger.log("Stack trace: " + error.stack);
        tg.sendMessage(adminBot, "Error di handleInlineQuery: " + error.message); // Kirim error ke admin

    }
}

function handleCallbackQuery(callbackQuery) {
     try{
        let data = callbackQuery.data;
        let cb = callbackQuery;

        Logger.log("handleCallbackQuery - Data: " + data); // Log data callback

        if (data === "help") {
            let pesan = "<b>Bantuan:</b>\n\n" +
                "Admin dapat mengunggah file (foto/dokumen) ke bot, atau meneruskan pesan ke bot. " +
                "File akan disimpan di Google Sheet. Pengguna dapat mencari file tersebut melalui pencarian inline " +
                "(ketik @nama_bot_kamu [spasi] query di chat mana pun).";  // Ganti @nama_bot_kamu
            sendMsgKeyboardInline2(cb, pesan, []);
        }
        tg.answerCallbackQuery(callbackQuery.id, "Perintah diterima!");
    } catch (error) {
        Logger.log("Error di handleCallbackQuery: " + error.message);
        Logger.log("Stack trace: " + error.stack);
        tg.sendMessage(adminBot, "Error di handleCallbackQuery: " + error.message); // Kirim error ke admin
    }
}

// --- Fungsi Penyimpanan Data ---

function saveForwardedMessage(msg) {
    try { // Tambahkan try-catch
        let fileId, fileName, fileType, caption, uploadedBy, messageLink;

        // Mendapatkan link pesan
        if (msg.forward_from_chat && msg.forward_from_chat.username) {
            messageLink = "https://t.me/" + msg.forward_from_chat.username + "/" + msg.forward_from_message_id;
        } else if (msg.forward_from_chat) {
            messageLink = "private chat/channel";
        } else if (msg.forward_sender_name) {
            messageLink = "forwarded from " + msg.forward_sender_name;
        }
        else {
            messageLink = "Unknown";
        }

        uploadedBy = msg.from.id;
        caption = msg.caption ? msg.caption : "";

        if (msg.photo) {
            let photo = msg.photo[msg.photo.length - 1];
            fileId = photo.file_id;
            fileName = "photo_" + fileId + ".jpg";
            fileType = "photo";
        } else if (msg.document) {
            fileId = msg.document.file_id;
            fileName = msg.document.file_name;
            fileType = "document";
        }

        Logger.log("saveForwardedMessage - File: " + fileName + ", Type: " + fileType); // Log info file

        let sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
        sheet.appendRow([fileId, fileName, fileType, caption, uploadedBy, messageLink]);

        tg.sendMessage(adminBot, `File ${fileName} tersimpan!`);

    } catch (error) {
        Logger.log("Error di saveForwardedMessage: " + error.message);
        Logger.log("Stack trace: " + error.stack);
        tg.sendMessage(adminBot, "Error saat menyimpan file: " + error.message);
    }
}
