(function () {
  "use strict";
   
  let forms = document.querySelectorAll('.webhook-email-form');

  forms.forEach( function(e) {
      e.addEventListener('submit', function(event) {
          event.preventDefault();
          
          let thisForm = this;
          sendEmbedRequest(thisForm);
      });
  });
  
  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function displayStatus(thisForm, state, error = 'Unexpected Error') {
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
  
  async function sendEmbedRequest(thisForm) {
      displayStatus(thisForm, 1)
      try {
          let name = thisForm.querySelector('#username').value;
          let email = thisForm.querySelector('#email').value;
          let subject = thisForm.querySelector('#subject').value;
          let mssg = thisForm.querySelector('#message').value;
          let embed = createWebhook(name, email, subject, mssg);
          
          const request = new XMLHttpRequest();
          request.open("POST", 'https://discord.com/api/webhooks/939582584940269648/aSQquHS0PvU5T9wjnh6MRK7stJ7f43cjhFvPT0-1pHcSyCzTNujIgm4upBsqCef5MIUi');
          request.setRequestHeader('Content-type', 'application/json');
          await request.send(JSON.stringify(embed));
          displayStatus(thisForm, 3)
      } catch {
          displayStatus(thisForm, 2, 'Action cannot perform right now, Kindly check your network or data you putted');
      }
      
  }
  
  function createWebhook(name, email, subject, mssg) {
      subject = '•' + subject;
      let utc = new Date().toISOString();
      let embed = {"content": null,"embeds": [{"title": subject,"description": mssg,"color": 11004306,"fields": [{"name": "Contact email:","value": email,"inline": true}],"author": {"name": name,"icon_url": "https://img.icons8.com/dusk/344/user.png"},"footer": {"text": "Hadestia: portfolio © 2022","icon_url": "https://hadestia.github.io/assets/img/webicon.png"},"timestamp": utc}],"attachments": []};
      return embed;
  }

})();