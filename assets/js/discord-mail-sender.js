(function () {
  "use strict";
   
  let forms = document.querySelectorAll('.webhook-email-form');

  forms.forEach( function(e) {
      e.addEventListener('submit', function(event) {
          event.preventDefault();
          
          let thisForm = this;
          //let path = this.getAttribute('ref-path');
          //let obj_ref = this.getAttribute('obj-ref');
          CreateEmbedRequest(thisForm);
      });
  });
  
  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function DisplayStatus(thisForm, state, error = 'Unexpected Error') {
      thisForm.querySelector('.loading').classList.remove('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');
      
      if (state == 1) {
          thisForm.querySelector('.loading').classList.add('d-block');
      } else if (state == 2) {
          thisForm.querySelector('.error-message').innerHTML = error;
          thisForm.querySelector('.error-message').classList.add('d-block');
          await sleep(4000);
          thisForm.querySelector('.error-message').classList.remove('d-block');
      } else if (state == 3) {
          thisForm.querySelector('.sent-message').classList.add('d-block');
          await sleep(4000);
          thisForm.querySelector('.sent-message').classList.remove('d-block');
          
          //delete users input data
          thisForm.querySelector('#username').value = '';
          thisForm.querySelector('#email').value = '';
          thisForm.querySelector('#subject').value = '';
          thisForm.querySelector('#message').value = '';
      }
  }
  
  async function CreateEmbedRequest(thisForm) {
      DisplayStatus(thisForm, 1);
      
      var object = thisForm.getAttribute('obj-ref');
      var path = 'assets/' + thisForm.getAttribute('ref-path');
      var HOST;
      
      await $.getJSON(path, async function(data) {
          var key = await data[object].key;
          var ref = await data[object].ref;
          var KEY = await CryptoJS.AES.decrypt(key, object).toString(CryptoJS.enc.Utf8);
          HOST = await CryptoJS.AES.decrypt(ref, KEY).toString(CryptoJS.enc.Utf8);
      });
      
      if (HOST) {
          try {
              let name = thisForm.querySelector('#username').value;
              let email = thisForm.querySelector('#email').value;
              let subject = thisForm.querySelector('#subject').value;
              let mssg = thisForm.querySelector('#message').value;
              let embed = CreateWebhook(name, email, subject, mssg);
              SendRequest(thisForm, HOST, embed);
          } catch (e) {
              DisplayStatus(thisForm, 2, 'Action cannot perform right now, Kindly check your network or data you putted');
          }
      } else {
          DisplayStatus(thisForm, 2, 'Unable to reach the server, try again later');
      }
  }
  
  async function SendRequest(thisForm, host, embed) {
      const request = new XMLHttpRequest();
      request.open("POST", host);
      request.setRequestHeader('Content-type', 'application/json');
      
      try {
          request.send(JSON.stringify(embed));
      } catch (e) {
          DisplayStatus(thisForm, 2, e.toString());
          return;
      }
      
      DisplayStatus(thisForm, 3)
  }
  
  function CreateWebhook(name, email, subject, mssg) {
      subject = '•' + subject;
      let utc = new Date().toISOString();
      let embed = {"content": null,"embeds": [{"title": subject,"description": mssg,"color": 11004306,"fields": [{"name": "Contact email:","value": email,"inline": true}],"author": {"name": name,"icon_url": "https://img.icons8.com/dusk/344/user.png"},"footer": {"text": "Hadestia: portfolio © 2022","icon_url": "https://hadestia.github.io/assets/img/webicon.png"},"timestamp": utc}],"attachments": []};
      return embed;
  }
  
})();