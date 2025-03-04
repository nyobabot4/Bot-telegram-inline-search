// ... (Fungsi-fungsi yang sudah ada dari function.gs kamu) ...

// Fungsi untuk mencari file di Google Sheet berdasarkan query
function searchFiles(query) {
    let sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    let data = sheet.getDataRange().getValues();
    let results = [];

    // Loop melalui data (mulai dari baris kedua, lewati header)
    for (let i = 1; i < data.length; i++) {
        let fileId = data[i][0];
        let fileName = data[i][1];
        let fileType = data[i][2];
        let caption = data[i][3];
        // let uploadedBy = data[i][4]; // Tidak digunakan dalam pencarian
        let messageLink = data[i][5]

        // Cek apakah query cocok dengan nama file atau caption
        if (fileName.toLowerCase().includes(query.toLowerCase()) || caption.toLowerCase().includes(query.toLowerCase())) {
            let result;

            if (fileType == "photo") {
                result = {
                    type: "photo",
                    id: fileId, // Gunakan fileId sebagai ID unik
                    photo_file_id: fileId, // ID file untuk dikirim kembali ke Telegram
                    title: fileName,
                    caption: caption + "\n<a href='" + messageLink + "'>Link</a>",
                    parse_mode: "HTML",

                };
            } else if (fileType == "document") {
                result = {
                    type: "document",
                    id: fileId,
                    document_file_id: fileId,
                    title: fileName,
                    caption: caption + "\n<a href='" + messageLink + "'>Link</a>",
                    parse_mode: "HTML",
                };
            }
            // else if (fileType == "video") ...

            if (result) { // Periksa apakah 'result' sudah diinisialisasi
                results.push(result);
            }
        }
    }

    return results;
}

// Fungsi-fungsi lain yang sudah kamu miliki (sendMsgKeyboardInline, dll.)
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
  let r = tg.request('sendMessage', data);
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
  let r = tg.request('sendMessage', data);
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
  let r = tg.request('sendMessage', data);
  return r;
}

// bot akan mengirim foto yang diisi caption + bonus inline keyboard
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
  return tg.request('sendPhoto', data);
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
  return tg.request('sendPhoto', data);
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
  return tg.request('sendPhoto', data);
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
  let r = tg.request('sendMessage', data);
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
  let r = tg.request('sendMessage', data);
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
      keyboard: keyboard,
    }
  }
  let r = tg.request('sendMessage', data);
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
  let r = tg.request('sendMessage', data);
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
  let r = tg.request('sendMessage', data);
  return r;
}

//cara make keyboard button contoh

//if ( /^\/start$/i.exec(msg.text) ){

// pesan buat dikirim
//    let pesan = "Halo, saya bot.\n\nSilakan pilih menu keyboard ini ya";

// buat 1 keyboard, berisi perintah /ping
//    let keyboard = [ 
//                ['/ping']
//           ]

// panggil fungsi sendMsgKeyboard yang dibuat sebelumnya
//    return sendMsgKeyboard1(msg.chat.id, pesan, keyboard);
//}

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
  return tg.request('sendPhoto', data);
}
