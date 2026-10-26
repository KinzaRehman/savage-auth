var thumbUp = document.getElementsByClassName("fa-thumbs-up");
var trash = document.getElementsByClassName("fa-trash");
var thumbDown = document.getElementsByClassName("fa-thumbs-down")




// for thumbs up closest 
Array.from(thumbUp).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.childNodes[1].dataset.userId
       //const name = this.closest("li").querySelector("span.name").innerText
       // const msg = this.closest("li").querySelector("span.msg").innerText
        const thumbUp = parseFloat(this.closest("li").querySelector("span.thumbUp").innerText) || 0
        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'id': id,
           // 'name': name,
            //'msg': msg,
            'thumbUp':thumbUp
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

//thumbs Down 
Array.from(thumbDown).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.childNodes[1].dataset.userId

      //  const name = this.closest("li").querySelector("span.name").innerText
       // const msg = this.closest("li").querySelector("span.msg").innerText
        const thumbDown = parseFloat(this.closest("li").querySelector("span.thumbUp").innerText) || 0
        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
           'id': id,
           // 'name': name,
           // 'msg': msg,
            'thumbDown':thumbDown
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

/*mathematic difference 1 
+1 -> -1 
2 clickls of thumbsDown -> -1 


*/

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.childNodes[1].dataset.userId

       // const name = this.parentNode.parentNode.childNodes[1].innerText
       // const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('deletemessages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'id': id,
           // 'name': name,
            //'msg': msg
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
