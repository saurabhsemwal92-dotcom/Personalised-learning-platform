// Users & current session
let users = JSON.parse(localStorage.getItem('plp_users')||'[]');
let currentUser = JSON.parse(localStorage.getItem('plp_currentUser')||'null');
let results = JSON.parse(localStorage.getItem('plp_results')||'[]');

// Helpers
function saveUsers(){localStorage.setItem('plp_users', JSON.stringify(users));}
function saveCurrentUser(){localStorage.setItem('plp_currentUser', JSON.stringify(currentUser));}
function saveResults(){localStorage.setItem('plp_results', JSON.stringify(results));}

// Show/Hide login/register forms
if(document.getElementById('showRegister')){
  document.getElementById('showRegister').onclick = ()=>{
    document.getElementById('loginBox').style.display='none';
    document.getElementById('registerBox').style.display='block';
  }
  document.getElementById('showLogin').onclick = ()=>{
    document.getElementById('registerBox').style.display='none';
    document.getElementById('loginBox').style.display='block';
  }
}

// Registration
if(document.getElementById('registerBtn')){
  document.getElementById('registerBtn').onclick = ()=>{
    let name=document.getElementById('regName').value;
    let email=document.getElementById('regEmail').value;
    let pass=document.getElementById('regPass').value;
    if(!name||!email||!pass){alert('Fill all fields'); return;}
    if(users.find(u=>u.email===email)){alert('Email exists'); return;}
    users.push({name,email,password:pass});
    saveUsers();
    alert('Registered! Login now.');
    document.getElementById('registerBox').style.display='none';
    document.getElementById('loginBox').style.display='block';
  }
}

// Login
if(document.getElementById('loginBtn')){
  document.getElementById('loginBtn').onclick = ()=>{
    let email=document.getElementById('loginEmail').value;
    let pass=document.getElementById('loginPass').value;
    let u=users.find(u=>u.email===email && u.password===pass);
    if(!u){alert('Invalid'); return;}
    currentUser=u; saveCurrentUser();
    window.location.href='dashboard.html';
  }
}

// Dashboard page logic
if(document.getElementById('userName')){
  document.getElementById('userName').innerText = currentUser.name;
  document.getElementById('logoutBtn').onclick = ()=>{
    currentUser=null; saveCurrentUser();
    window.location.href='index.html';
  }

  // Section switching
  document.getElementById('materialsBtn').onclick = ()=>{
    document.getElementById('materialsSection').style.display='block';
    document.getElementById('quizSection').style.display='none';
    document.getElementById('dashboardSection').style.display='none';
  }
  document.getElementById('quizBtn').onclick = ()=>{
    document.getElementById('materialsSection').style.display='none';
    document.getElementById('quizSection').style.display='block';
    document.getElementById('dashboardSection').style.display='none';
  }
  document.getElementById('dashboardBtn').onclick = ()=>{
    document.getElementById('materialsSection').style.display='none';
    document.getElementById('quizSection').style.display='none';
    document.getElementById('dashboardSection').style.display='block';
    renderDashboard();
  }

  // --- Interactive Materials Feature ---
  const notesKey = currentUser.email + '_notes';
  document.getElementById('searchTopic').onclick = ()=>{
    const subject=document.getElementById('subjectSelect').value;
    const topic=document.getElementById('topicInput').value.trim();
    if(!topic){alert('Enter topic'); return;}
    const url=`https://www.google.com/search?q=${subject}+${topic}+site:edu`;
    window.open(url,'_blank');
  }

  // Save notes
  document.getElementById('saveNotes').onclick = ()=>{
    const subject=document.getElementById('subjectSelect').value;
    const topic=document.getElementById('topicInput').value.trim();
    const note=document.getElementById('topicNotes').value;
    if(!topic){alert('Enter topic first'); return;}
    let allNotes=JSON.parse(localStorage.getItem(notesKey)||'{}');
    allNotes[subject+'_'+topic]=note;
    localStorage.setItem(notesKey,JSON.stringify(allNotes));
    alert('Notes saved!');
  }

  // Load notes when topic changes
  document.getElementById('topicInput').onblur = ()=>{
    const subject=document.getElementById('subjectSelect').value;
    const topic=document.getElementById('topicInput').value.trim();
    let allNotes=JSON.parse(localStorage.getItem(notesKey)||'{}');
    if(topic && allNotes[subject+'_'+topic]) document.getElementById('topicNotes').value = allNotes[subject+'_'+topic];
    else document.getElementById('topicNotes').value='';
  }

  // --- Quiz Logic ---
  let currentQuiz={questions:[]};
  document.getElementById('startQuizBtn').onclick = ()=>{
  let n = parseInt(document.getElementById('numQ').value);
  let selectedSubject = document.getElementById('quizSubject').value;
  let pool = selectedSubject === 'All' ? QUESTIONS_POOL : QUESTIONS_POOL.filter(q => q.subject === selectedSubject);
  if(pool.length === 0){ alert('No questions for selected subject!'); return; }
  currentQuiz.questions = pool.sort(()=>0.5-Math.random()).slice(0,n);
  renderQuiz();
}


  function renderQuiz(){
    let form=document.getElementById('quizForm');
    form.innerHTML=''; form.style.display='block';
    currentQuiz.questions.forEach((q,i)=>{
      let div=document.createElement('div'); div.className='quiz-question';
      div.innerHTML = `<p>${i+1}. ${q.question}</p>` +
        q.options.map((opt,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${opt}</label>`).join('');
      form.appendChild(div);
    });
    let submit=document.createElement('button'); submit.type='button'; submit.innerText='Submit'; submit.onclick=submitQuiz;
    form.appendChild(submit);
  }

  function submitQuiz(){
    let score=0;
    currentQuiz.questions.forEach((q,i)=>{
      let sel=document.querySelector(`input[name="q${i}"]:checked`);
      if(sel && parseInt(sel.value)===q.answer) score++;
    });
    let percent=(score/currentQuiz.questions.length)*100;
    alert(`You scored ${score}/${currentQuiz.questions.length} (${percent.toFixed(2)}%)`);
    results.push({user:currentUser.email, score, date:new Date().toLocaleString()});
    saveResults();
    if(percent<50) alert('You should revise weak topics!');
    document.getElementById('quizForm').style.display='none';
  }

  // --- Dashboard ---
  function renderDashboard(){
    const ctx=document.getElementById('scoreChart').getContext('2d');
    let userResults=results.filter(r=>r.user===currentUser.email);
    let labels=userResults.map(r=>r.date);
    let data=userResults.map(r=>r.score);
    new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Score', data, backgroundColor:'#4b6cb7'}]},options:{}});
    document.getElementById('pastResults').innerHTML='<h3>Past Results:</h3>'+userResults.map(r=>`<div>${r.date}: ${r.score}</div>`).join('');
  }
}
