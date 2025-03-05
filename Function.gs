// --- Fungsi Pencarian (searchFiles) ---
function searchFiles(query, limit = 50) {
    try {
        Logger.log("searchFiles dijalankan! Query: " + query + ", Limit: " + limit);
        let sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
        let data = sheet.getDataRange().getValues();
        let results = [];
        let usedIds = {};

        for (let i = 1; i < data.length; i++) { // Mulai dari 1 (lewati header)
            let fileId = data[i][0];
            let fileName = data[i][1];
            let fileType = data[i][2];
            let caption = data[i][3]; // Caption asli
            let messageLink = data[i][5];

            // Pengecekan fileId dan duplikat ID
            if (!fileId || typeof fileId !== 'string') {
                Logger.log("WARNING: fileId tidak valid. Melewati baris ini.");
                continue;
            }

            let id = fileId;
            let counter = 1;
            while (usedIds[id]) {
                id = fileId + "_" + counter;
                counter++;
            }
            usedIds[id] = true;
            id = id.substring(0, 64); // Batasi panjang ID

            // Pencarian (case-insensitive)
            let queryLower = query ? query.toLowerCase() : "";
            let fileNameLower = fileName ? fileName.toLowerCase() : "";
            let captionLower = caption ? caption.toLowerCase() : "";

            if (fileNameLower.includes(queryLower) || captionLower.includes(queryLower)) {
                let result;
                // --- CUSTOM CAPTION ---
                let customCaption = "Selamat! Anda menemukan file ini.\n";
                customCaption += caption ? caption + "\n\n" : ""; // Tambahkan caption asli (jika ada)
                customCaption += "Cari file lain? Ketik @Wispydream_bot [spasi] kata kunci."; // GANTI DENGAN NAMA BOT ANDA!

                if (fileType == "photo") {
                    result = {
                        type: "photo",
                        id: id,
                        photo_file_id: fileId,
                        title: fileName,
                        caption: customCaption, // Gunakan custom caption
                        parse_mode: "HTML",
                    };
                } else if (fileType == "document") {
                    result = {
                        type: "document",
                        id: id,
                        document_file_id: fileId,
                        title: fileName,
                        caption: customCaption, // Gunakan custom caption
                        parse_mode: "HTML",
                        thumb_url: "", // Tetap sertakan, meskipun kosong
                        thumb_width: 50,
                        thumb_height: 50
                    };
                }

                if (result) {
                    results.push(result);
                }

                if (results.length >= limit) {
                    break; // Hentikan setelah mencapai limit
                }
            }
        }

        Logger.log("Hasil pencarian (searchFiles): " + JSON.stringify(results));
        return results;
    } catch (error) {
        Logger.log("Error di searchFiles: " + error.message);
        Logger.log("Stack trace: " + error.stack);
        return []; // Kembalikan array kosong jika terjadi error
    }
}

// --- Fungsi-fungsi Telegram Lainnya (Menggunakan Library) ---

//inline keyboard v1
function sendMsgKeyboardInline(msg, pesan, keyboard) {
  let data = {
    chat_id: msg.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

//inline keyboard v2 bisa reply message
function sendMsgKeyboardInline1(msg, pesan, keyboard) {
  let msg_id = msg.message_id;
  let data = {
    chat_id: msg.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    reply_to_message_id: msg_id,
    reply_markup: {
      inline_keyboard: keyboard
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

//inline keyboard v3 buat callback
function sendMsgKeyboardInline2(cb, pesan, keyboard) {
  let data = {
    chat_id: cb.message.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: keyboard,
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

// bat akan mengirim foto yang diisi caption + bonus inline keyboard
function kirimPesanX(msg, url_foto, caption, keyboard) {
  // bot akan mereply pesan dari user
  let msg_id = msg.message_id;
  //fetch data 
  let data = {
    chat_id: msg.chat.id,
    photo: url_foto,
    caption: caption,
    parse_mode: 'HTML',
    reply_to_message_id: msg_id,
    reply_markup: {
      inline_keyboard: keyboard
    }
  }
  //bot mengirim pesan kirim
  return telegram.request('sendPhoto', data); // Menggunakan library
}

function kirimPesanX1(msg, url_foto, caption, keyboard) {
  let data = {
    chat_id: msg.chat.id,
    photo: url_foto,
    caption: caption,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard,
      selective: true,
    }
  }
  //bot mengirim pesan kirim
  return telegram.request('sendPhoto', data); // Menggunakan library
}

// callback keyboard khusus kirim foto
function callbackKeyboard(cb, url_foto, caption, keyboard) {
  let data = {
    chat_id: cb.message.chat.id,
    photo: url_foto,
    caption: caption,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard
    }
  }
  //bot mengirim pesan kirim
  return telegram.request('sendPhoto', data); // Menggunakan library
}

//reply message backup klo gk bisa
function sendMsgkawan(msg, pesan) {

  //inisiasi awal message id yg akan direply
  let msg_id = msg.message_id;

  //jika pesannya mereply pesan lain, message idnya akan diupdate
  if (msg.reply_to_message) {
    msg_id = msg.reply_to_message.message_id;
  }

  //data yang akan dikirim
  let data = {
    chat_id: msg.chat.id,
    text: pesan,
    reply_to_message_id: msg_id,
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

//inline button v1 biasa
function sendMsgKeyboard(msg, pesan, keyboard) {
  let data = {
    chat_id: msg.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      selective: true,
      keyboard: keyboard
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

//inline button v2 reply message
function sendMsgKeyboard1(msg, pesan, keyboard) {
  //bot reply pesanmu
  let msg_id = msg.message_id;
  let data = {
    chat_id: msg.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    reply_to_message_id: msg_id,
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      selective: true,
      keyboard: keyboard
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

//inline button v3 buat callback
function sendMsgKeyboard2(cb, pesan, keyboard) {
  let data = {
    chat_id: cb.message.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: keyboard,
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}

function removeKeyboard(msg, pesan) {
  let msg_id = msg.message_id;
  let data = {
    chat_id: msg.chat.id,
    text: pesan,
    parse_mode: 'HTML',
    reply_to_message_id: msg_id,
    reply_markup: {
      remove_keyboard: true
    }
  }
  let r = telegram.request('sendMessage', data); // Menggunakan library
  return r;
}


//batasi akses
// sesuaikan user ID / chat ID yang akan dilimit. Ini hanya contoh saja.
var punyaAkses = [-1001519861998, 2109541199, 1104560929];
function diizinkan(id) {
  if (punyaAkses.indexOf(id) > -1) {
    return true;
  } else {
    return false;
  }
}


function sendPhoto() {
    var data = {
      chat_id: 2109541199,
      photo: UrlFetchApp.getRequest,
      caption: 'Ini data Foto yang dikirim via URL'
    };
    return telegram.request('sendPhoto',data); // Menggunakan library
}
