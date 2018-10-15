const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN } = require('../config')
var async = require('async')
var API_Call = require('./api')('another');
var rp = require('request-promise');

class Directive {
  constructor({ namespace, name, payload }) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

class CEKRequest {
  constructor(httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    this.value = ""
    
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse);
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('안녕하세요. 클라스 알리미입니다. 1번 급한 과제 알려줘');
    cekResponse.setMultiturn({
      intent: 'InformKhuAss',
    })
  }

  async intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
      case 'InformKhuAss':
        var options = {
          method: 'POST',
          uri: 'http://175.195.89.200:9999/board',
          body: {
              "id": "2014104161",
              "pw": "dkfkq486!!"
          },
          json: true // Automatically stringifies the body to JSON
        };
        var value =""
        var result = await rp(options).then(function(parsedBody){
          value = parsedBody["board"][0];
        })
        console.log(value);
        cekResponse.appendSpeechText(`${value.instructor}님의 가장 급한 과제는 ${value.class_name}과목의 ${value.class_code}이고 마감 기한은 어제까지 입니다.`);

        console.log("case 종료")
        break

      case 'InformKhuLec':
        let namee = "허진호"
        let coursee = "소프트웨어적 사유"
        let titlee = "lec 02"
        let timee = "2018-10-05"

        // 급한 인강 불러오기
        cekResponse.appendSpeechText(`${namee}님의 가장 급한 인터넷 강의는 ${coursee}과목의 ${titlee}이고 마감 기한은 ${timee}까지 입니다.`)
        break

      // case 'InformWeekAss':
      // let namee = "허진호"
      // let coursee = "소프트웨어적 사유"
      // let titlee = "lec 02"
      // let timee = "2018-10-05"
      // let count;

      // // 이번주 마감 과제 불러오기

      // cekResponse.appendSpeechText(`${namee}님의 이번주 마감 과제 개수는 총 ${count}개 이고`);
      // for(var i=0; i<count; i++){
      //   cekResponse.appendSpeechText(`${coursee}과목의 ${titlee}이고 마감 기한은 ${timee}까지 입니다.`)
      // }
      // break

      // case 'InformWeekLec':
      // let namee = "허진호"
      // let coursee = "소프트웨어적 사유"
      // let titlee = "lec 02"
      // let timee = "2018-10-05"

      // // 이번주 마감 인강 불러오기

      // cekResponse.appendSpeechText(`${namee}님의 이번주 마감 인터넷 강의 개수는 총 ${count}개 이고`);
      // for(var i=0; i<count; i++){
      //   cekResponse.appendSpeechText(`${coursee}과목의 ${titlee}이고 마감 기한은 ${timee}까지 입니다.`)
      // }
      // break

      default:
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }

    console.log("함수 종료")
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('클라스 알리미를 종료합니다.')
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor() {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    console.log(outputText)
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof (outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })

    } else {
      outputSpeech.values.push(outputText)
    }
  }

}

const clovaReq = async function (httpReq, httpRes, next) {
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  var result = await cekRequest.do(cekResponse)
  
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

function sleep(ms) {
  return new Promise(resolve => {
      console.log(`starting ${ms}`);
      setTimeout(() => {
          console.log(`done ${ms}`);
          resolve(ms);
      }, ms);
  });
} 

module.exports = clovaReq;
