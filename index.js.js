const express = require('express');
const { Client } = require('@line/bot-sdk');
const dotenv = require('dotenv');
const axios = require('axios');
const schedule = require('node-schedule');

dotenv.config();

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// เรียก eventHandler เพื่อล็อก userId
async function handleEvent(event) {
  await eventHandler(event);

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: 'สวัสดีเพื่อนทอม! รับทราบข้อความแล้วครับ',
  });
}

// log userId
const eventHandler = async (event) => {
  console.log('===> USER_ID:', event.source?.userId || 'ไม่พบ userId');
};

// ส่งข่าวทุกเช้า
function sendMorningNews() {
  const headers = {
  'Content-Type': 'application/json',
   'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
};


  const body = {
    to: process.env.USER_ID,
    messages: [
      {
        type: 'text',
        text: 'สรุปข่าวเช้า: วันนี้ยังไม่มีข่าวแรงในตาราง แนะนำรอข่าว EUR เวลา 20:30 และ Lagarde พูดเวลา 22:00 น.'
      }
    ]
  };

  axios.post('https://api.line.me/v2/bot/message/push', body, { headers })
    .then(() => console.log('ส่งข่าวเช้าแล้ว!'))
    .catch(err => console.error('ส่งไม่สำเร็จ:', err.response?.data || err.message));
}

// ตั้งเวลา 08:00 ทุกวัน
schedule.scheduleJob('0 8 * * *', () => {
  sendMorningNews();
});

// เริ่ม server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});