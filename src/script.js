USERNAME = "tu_username";

async function playSound(filename){
  var mp3Source = '<source src="./media/' + filename + '.mp3" type="audio/mpeg">';
  var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
  var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
  document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
}
const divResult = document.getElementById("divResult")
const divComment = document.getElementById("divComment")
window.currentIssues;
window.currentComments;
getIssues();
getComments();

setInterval(getIssues, 12000);
setInterval(getComments, 12000);



async function getIssues() {
    console.log("getting issues");
    const url = "https://api.github.com/search/issues?q=repo:IIC2233/syllabus type:issue is:issue is:open no:assignee -label:resuelto created:>=" + two_days_ago() + "  -label:\"resuelto por estudiante\""
    const response = await fetch(url)
    const result = await response.json()
    if (!result.items) {
      return;
    }
    if (window.currentIssues == undefined) {
      window.currentIssues = result;
    }else {
      if (window.currentIssues.items.length == result.items.length) {
        return
      }else if (window.currentIssues.items.length < result.items.length) {
        playSound('new_issue');
        window.currentIssues = result;
      }else if (window.currentIssues.items.length > result.items.length) {
        playSound('lost_issue');
        window.currentIssues = result;
      }
    }
    clear();
    if (result.items.length ) {
      result.items.forEach(i=>{
          const anchor = document.createElement("a")
          anchor.href = i.html_url;
          anchor.textContent = i.title;
          divResult.appendChild(anchor)
          divResult.appendChild(document.createElement("br"))
      })
    }else {
      const notif = document.createElement("p")
      notif.textContent = "No hay nuevas issues"
      divResult.appendChild(notif)
    }


}

async function getComments() {
  console.log("getting commments");
// Consigo todos los comentarios y mis issues
    const url1 = "https://api.github.com/search/issues?q=repo:IIC2233/syllabus type:issue is:issue is:open assignee:" + USERNAME
    const response1 = await fetch(url1)
    const my_issues = await response1.json()
    const url2 = "https://api.github.com/repos/IIC2233/syllabus/issues/comments"
    const response2 = await fetch(url2)
    const all_comments = await response2.json()
    if (!my_issues.items || !all_comments) {
      return
    }
    // Comparo y dejo solo los comentarios de mis ISSUES
    var pending_comments = new Array();
    my_issues.items.forEach(issue => {
      var latest_comment;
      all_comments.forEach(comment => {
        if (issue.url == comment.issue_url) {
          if (!latest_comment) {
            latest_comment = comment;
          }else if (new Date(latest_comment.created_at) < new Date(comment.created_at)) {
            latest_comment = comment;
          }
        }
      });
      if (latest_comment) {
        if (latest_comment.user.login !== USERNAME) {
          latest_comment.issue_number = issue.number
          pending_comments.push(latest_comment);
        }
      }

    });

    if (window.currentComments == undefined) {
      window.currentComments = pending_comments;
    }else {
      if (window.currentComments.length == pending_comments.length) {
        return
      }else if (window.currentComments.length < pending_comments.length) {
        playSound('new_comment');
        window.currentComments = pending_comments;
      }else if (window.currentComments.length > pending_comments.length) {
        window.currentComments = pending_comments;
      }
    }
    clearComments();
    if (pending_comments.length) {
      // playSound('new_issue');
      pending_comments.forEach(i=>{
          const anchor = document.createElement("a")
          anchor.href = i.html_url;
          anchor.textContent = i.user.login + 'en issue' + i.issue_number;
          divComment.appendChild(anchor)
          divComment.appendChild(document.createElement("br"))
      })
    }else {
      const notif = document.createElement("p")
      notif.textContent = "No hay nuevos comentarios"
      divComment.appendChild(notif)
    }


}

function clear(){
    while(divResult.firstChild)
        divResult.removeChild(divResult.firstChild)
}

function clearComments(){
    while(divComment.firstChild)
        divComment.removeChild(divComment.firstChild)
}

function two_days_ago() {
  var date = new Date();

  date ; //# => Fri Apr 01 2011 11:14:50 GMT+0200 (CEST)

  date.setDate(date.getDate() - 2);

  date ;

  month = '' + (date.getMonth() + 1),
  day = '' + date.getDate(),
  year = date.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  return [year, month, day].join('-');
} //# => Thu Mar 31 2011 11:14:50 GMT+0200 (CEST)
