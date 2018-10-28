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

  async launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('과제 업데이트 중입니다.');
    var options = {
      method: 'POST',
      uri: 'http://175.195.89.200:9999/update',
      body: {
          "id": "2014104161",
          "pw": "dkfkq486!!"
      },
      json: true // Automatically stringifies the body to JSON
    };
    cekResponse.setMultiturn({
      intent: 'InformKhuAss',
    })
    var name1, ass1, ass2;
    await rp(options).then(function(parsedBody){
      result = parsedBody["name"]
    })
    cekResponse.appendSpeechText('과제 업데이트가 완료되었습니다.');
  
    cekResponse.appendSpeechText('안녕하세요. 클라스 알리미입니다. 1번 급한 과제 알려줘, 2번 급한 강의 알려줘');
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
          uri: 'http://175.195.89.200:9999/clovaAss',
          body: {
              "id": "2014104161",
              "pw": "dkfkq486!!"
          },
          json: true // Automatically stringifies the body to JSON
        };
        
        var name1, ass1, ass2;
        await rp(options).then(function(parsedBody){
          name1 = parsedBody["NAME"]
          ass1 = parsedBody["ASS"][0];
          ass2 = parsedBody["ASS"][1];
        })

        cekResponse.appendSpeechText(`${name1}님의 가장 급한 과제는 ${ass1.workCourse} 수업의 ${ass1.workTitle}이고 마감 기한은 ${ass1.workFinishTime}까지이고.`);
        cekResponse.appendSpeechText(`두 번째로 급한 과제는 ${ass2.workCourse} 수업의 ${ass2.workTitle}이고 마감 기한은 ${ass2.workFinishTime}까지입니다.`);
        console.log("InformKhuAss case 종료")
        break

      case 'InformKhuLec':
      var options = {
        method: 'POST',
        uri: 'http://175.195.89.200:9999/clovaLec',
        body: {
            "id": "2014104161",
            "pw": "dkfkq486!!"
        },
        json: true // Automatically stringifies the body to JSON
      };

      var name2, lec1, lec2;
      await rp(options).then(function(parsedBody){
        name2 = parsedBody["NAME"]
        lec1 = parsedBody["LEC"][0];
        lec2 = parsedBody["LEC"][1];
      })
      
      cekResponse.appendSpeechText(`${name2}님의 가장 급한 인터넷 강의는 ${lec1.workCourse} 수업의 ${lec1.workTitle}이고 마감 기한은 ${lec1.workFinishTime}까지이고.`);
      cekResponse.appendSpeechText(`두 번째로 급한 과제는 ${lec2.workCourse} 수업의 ${lec2.workTitle}이고 마감 기한은 ${lec2.workFinishTime}까지입니다.`);
      console.log("InformKhuLec case 종료")
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

    console.log("intentRequest 함수 종료")
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
