var request  = require('request');
var jsdom    = require('jsdom');
var fs       = require('fs');
var conf     = require('./conf');

const { JSDOM } = jsdom;

var members = [], membersData = [];
var window;

function saveDataToFile(data){
  fs.appendFile(conf.DATAPATH, data, function(err) {
      if(err) {
          return console.log(err);
      }
      if(data.length > 0){
        console.log('data was saved');
      }
  });
}

function getPolicyComparison(url, callback){
  request(url, function(err, resp, body)
  {
    var data = [];
    if(!err && resp.statusCode === 200)
    {
       window = new JSDOM(body).window;
       var data = [];
        var $ = require('jquery')(window);
        $('table.mps tr').each(function(){
          var policy = {
            percent: $(this).find('td:first-child').text().replace('%',''),
            name: $(this).find('td:nth-child(2)').text(),
            link: $(this).find('td:nth-child(2) a').attr('href')
          }
          if(policy.percent !== 'Agreement' && policy.percent !== 'No results found'){
            data.push(policy);
          }
        });

        callback(data);

    } else{
      console.log(err);
    }
  });

}

function getPolicyComparisons(){
  if(members.length){
    var member = members.pop();

    getPolicyComparison(member.url, function(data){
      member.policies = data;
      membersData.push(member);
      getPolicyComparisons();
    })
  } else{
    saveDataToFile(JSON.stringify(membersData));
  }
}

request(conf.MPSURL, function(err, resp, body)
{
  var data = [];
  if(!err && resp.statusCode === 200)
  {
     window = new JSDOM(body).window;

      var $ = require('jquery')(window);
      var flag = true;
      $('table.mps tr').each(function(){
        var member = $(this).find('td:first-child');
        var name = member.text();
        if(name !== 'Name') {
          members.push({
            party: $(this).find(':nth-child(3)').text(),
            name: name,
            url: conf.BASE + member.find('a').attr('href')
          });
        }

      });
      getPolicyComparisons();
  } else{
    console.log(err);
  }
});
