var token = "7849305390:AAHsD9O-IhGyLnCJPxOoIg1a_acn5spNOFA"; // GANTI dengan token bot kamu
const tg = new telegram.daftar(token);
const adminBot = 2109541199; // GANTI dengan ID admin kamu
const spreadsheetId = "10TupgRfroPas2SjNNY19Q4uB82AYGUVwIIisBxb9Mgg"; // GANTI dengan ID Spreadsheet kamu!
const debug = false; // Set ke true untuk debugging

// --- Fungsi-fungsi Telegram (dari code.gs kamu) ---
function getMe() {
    let me = tg.getMe();
    return Logger.log(me);
}

function setWebhook() {
    var url = "YOUR_WEB_APP_URL"; // GANTI dengan URL Web App kamu setelah deploy!
    var r = tg.setWebhook(url);
    return Logger.log(r);
}

function getWebhookInfo() {
    let hasil = tg.getWebhookInfo();
    return Logger.log(hasil);
}

function deleteWebhook() {
    let hasil = tg.deleteWebhook();
    return Logger.log(hasil);
}

// --- Fungsi utama (doPost) ---
function doPost(e) {
    if (debug) {
        tg.sendMessage(adminBot, JSON.stringify(e, null, 2));
    }

    let update = JSON.parse(e.postData.contents);

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
}

// --- Handler Commands dan Callbacks ---

function startCommand(msg) {
    let keyboard = [
        [{ text: "Cari File", switch_inline_query_current_chat: "" }], // Tombol cari (inline)
        [{ text: "Bantuan", callback_data: "help" }], // Tombol bantuan
    ];
    sendMsgKeyboardInline(msg, "Selamat datang! Gunakan tombol di bawah untuk mencari file atau mendapatkan bantuan.", keyboard);
}

function handleInlineQuery(inlineQuery) {
    let query = inlineQuery.query;
    let results = searchFiles(query); // Panggil searchFiles

    let response = {
        inline_query_id: inlineQuery.id,
        results: JSON.stringify(results), // Hasil *harus* JSON string
        cache_time: 10,
    };

    tg.request("answerInlineQuery", response);
}

function handleCallbackQuery(callbackQuery) {
    let data = callbackQuery.data;
    let cb = callbackQuery;
    if (data === "help") {
        let pesan = "<b>Bantuan:</b>\n\n" +
            "Admin dapat mengunggah file (foto/dokumen) ke bot, atau meneruskan pesan ke bot. " +
            "File akan disimpan di Google Sheet. Pengguna dapat mencari file tersebut melalui pencarian inline " +
            "(ketik @nama_bot_kamu [spasi] query di chat mana pun)."; // Ganti @nama_bot_kamu
        sendMsgKeyboardInline2(cb, pesan, []);
    }
    tg.answerCallbackQuery(callbackQuery.id, "Perintah diterima!"); // Konfirmasi callback
}

// --- Fungsi Penyimpanan Data ---

function saveForwardedMessage(msg) {
    try {
        let fileId, fileName, fileType, caption, uploadedBy, messageLink;

        // Mendapatkan link pesan
        if (msg.forward_from_chat && msg.forward_from_chat.username) {
            messageLink = "https://t.me/" + msg.forward_from_chat.username + "/" + msg.forward_from_message_id;
        } else if (msg.forward_from_chat) {
            messageLink = "private chat/channel";
        } else if (msg.forward_sender_name) {
            messageLink = "forwarded from " + msg.forward_sender_name;
        } else {
            messageLink = "Unknown";
        }

        uploadedBy = msg.from.id;
        caption = msg.caption ? msg.caption : "";

        if (msg.photo) {
            // Ambil photo dengan ukuran terbesar
            let photo = msg.photo[msg.photo.length - 1];
            fileId = photo.file_id;
            fileName = "photo_" + fileId + ".jpg";
            fileType = "photo";
        } else if (msg.document) {
            fileId = msg.document.file_id;
            fileName = msg.document.file_name;
            fileType = "document";
        } // Tambahkan else if untuk video, audio, dll. jika perlu

        // Simpan ke Sheet
        let sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
        sheet.appendRow([fileId, fileName, fileType, caption, uploadedBy, messageLink]);

        tg.sendMessage(adminBot, `File ${fileName} tersimpan!`);

    } catch (error) {
        tg.sendMessage(adminBot, "Error saat menyimpan file: " + error.message);
        Logger.log(error.stack); // Lebih detail error logging
    }
}
