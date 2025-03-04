var token = "7849305390:AAHsD9O-IhGyLnCJPxOoIg1a_acn5spNOFA"; // Ganti dengan token bot kamu

const tg = new telegram.daftar(token);

const adminBot = 2109541199; // Ganti dengan ID admin kamu
const spreadsheetId = "10TupgRfroPas2SjNNY19Q4uB82AYGUVwIIisBxb9Mgg"; // Ganti dengan ID Spreadsheet kamu!

const debug = false;

// Fungsi-fungsi dari code.gs kamu (getMe, setWebhook, dll.) ... letakkan di sini ...
function getMe() {
  let me = tg.getMe()
  return Logger.log(me)
}

function setWebhook() {
  var url = "yourwebhooklink"
  var r = tg.setWebhook(url)
  return Logger.log(r)
}

// cek info hook bot
function getWebhookInfo() {
  let hasil = tg.getWebhookInfo()
  return Logger.log(hasil)
}

// hapus hook
function deleteWebhook() {
  let hasil = tg.deleteWebhook()
  return Logger.log(hasil)

}
// Fungsi utama untuk menerima dan memproses update dari Telegram
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
      }
      else if (msg.forward_from || msg.forward_from_chat || msg.photo || msg.document) { // Prioritaskan forward dan file
        saveForwardedMessage(msg);
      }
       else {
        // Pesan teks biasa dari admin yang tidak dikenali, beri tahu
        tg.sendMessage(adminBot, "Perintah tidak dikenali atau tidak ada file/forward yang diproses.");
      }

    } else {
      // Pesan dari non-admin, abaikan atau beri pesan
      tg.sendMessage(msg.chat.id, "Maaf, saya hanya merespons perintah dari admin.");
    }
  }
}


// --- Fungsi-fungsi handler ---

function startCommand(msg) {
    let keyboard = [
        [{ text: "Cari File", switch_inline_query_current_chat: "" }],
        [{ text: "Bantuan", callback_data: "help" }],
    ];
    sendMsgKeyboardInline(msg, "Selamat datang!  Gunakan tombol di bawah untuk mencari file atau mendapatkan bantuan.", keyboard);
}

function handleInlineQuery(inlineQuery) {
    let query = inlineQuery.query;
    let results = searchFiles(query); // Implementasikan fungsi ini di function.gs

    let response = {
        inline_query_id: inlineQuery.id,
        results: JSON.stringify(results), // Hasil harus dalam format JSON string
        cache_time: 10, // Cache sebentar
    };

    tg.request("answerInlineQuery", response);
}


function handleCallbackQuery(callbackQuery) {
    let data = callbackQuery.data;
    let cb = callbackQuery
    if (data === "help") {
        let pesan = "<b>Bantuan:</b>\n\n" +
            "Admin dapat mengunggah file (foto/dokumen) ke bot, atau meneruskan pesan ke bot. " +
            "File akan disimpan di Google Sheet.  Pengguna dapat mencari file tersebut melalui pencarian inline (ketik @nama_bot query di chat mana pun).";
        // editMessageText tidak bisa pakai keyboard, minimal ganti text. pakai sendMessage biasa
        // tg.editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, pesan, null, "HTML");
        sendMsgKeyboardInline2(cb, pesan, [])
    }

     tg.answerCallbackQuery(callbackQuery.id, "Perintah diterima!");

}

// --- Fungsi-fungsi untuk menyimpan data (dipanggil dari doPost) ---
function saveForwardedMessage(msg) {
    let fileId, fileName, fileType, caption, uploadedBy, messageLink;

    // Mendapatkan link pesan
    if (msg.forward_from_chat && msg.forward_from_chat.username)
    { messageLink = "https://t.me/" + msg.forward_from_chat.username + "/" + msg.forward_from_message_id;
    }
    else if (msg.forward_from_chat)
    {
      messageLink = "private chat/channel"
    }
     else if (msg.forward_sender_name) {
        messageLink = "forwarded from " + msg.forward_sender_name;
    } else {
        messageLink = "Unknown"; // Atau sesuaikan
    }

    uploadedBy = msg.from.id;
    caption = msg.caption ? msg.caption : "";

    if (msg.photo) {
        // Ambil photo dengan ukuran terbesar
        let photo = msg.photo[msg.photo.length - 1];
        fileId = photo.file_id;
        fileName = "photo_" + fileId + ".jpg"; // Nama file sederhana
        fileType = "photo";
    } else if (msg.document) {
        fileId = msg.document.file_id;
        fileName = msg.document.file_name;
        fileType = "document";
    }
    // else if (msg.video) ... tambahkan jenis file lain jika perlu

    // Simpan ke Sheet
    let sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    sheet.appendRow([fileId, fileName, fileType, caption, uploadedBy, messageLink]);

    tg.sendMessage(adminBot, `File ${fileName} tersimpan!`);
}
