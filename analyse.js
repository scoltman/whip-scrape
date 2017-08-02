var request  = require('request');
var jsdom    = require('jsdom');
var fs       = require('fs');
var conf     = require('./conf');

const { JSDOM }   = jsdom;

fs.readFile(conf.DATAPATH, function(err, data) {

      if(err) {
          return console.log(err);
      }

      let parties = {};
      let members = JSON.parse(data.toString());

      for (let i = 0; i < members.length; i++) {
        if(!parties[members[i].party]){
          parties[members[i].party] = {
            count : 1,
            policies : []
          };
        } else {
          parties[members[i].party].count++;
        }
        for (let j = 0; j < members[i].policies.length; j++) {
          let memberPolicy = members[i].policies[j];
          let existingPolicy = false;
          for (let k = 0; k < parties[members[i].party].policies.length; k++) {
            if(parties[members[i].party].policies[k].name === memberPolicy.name){
              existingPolicy = true;
              parties[members[i].party].policies[k].percent += parseInt(memberPolicy.percent, 10);
            }
          }
          if(!existingPolicy){
            parties[members[i].party].policies.push({
              name: memberPolicy.name,
              percent: parseInt(memberPolicy.percent, 10),
              link: BASE + memberPolicy.link
            })
          }
        }
      }

      for (let party in parties) {
        if (parties.hasOwnProperty(party)) {
          for (let i = 0; i < parties[party].policies.length; i++) {
            parties[party].policies[i].percent = Math.floor(parties[party].policies[i].percent / parties[party].count);
          }
        }
        delete parties[party].count;
      }

      fs.appendFile(conf.SAVEPATH, 'var ' + conf.SAVEVARNAME + ' = '+JSON.stringify(parties)+';', function(err) {
          if(err) {
              return console.log(err);
          }
      });

});
