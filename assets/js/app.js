const cl=console.log;

const showmodelbtn =document.getElementById("showmodelbtn")
const backDrop= document.getElementById("backDrop")
const moviemodel = document.getElementById("moviemodel")
const closemoviemodelbtn =[...document.querySelectorAll(".closemoviemodel")]
const movieForm =document.getElementById("movieForm")
const movienamecontrol=document.getElementById("moviename")
const moviedescriptioncontrol=document.getElementById("moviedescription")
const movieimgcontrol=document.getElementById("movieimg")
const moviecardtemplte= document.getElementById("moviecardtemplte")
const movieUpdatedbtn=document.getElementById("movieUpdatedbtn")
const movieaddbtn=document.getElementById("movieaddbtn")
const spiner  = document.getElementById("spiner")


const sanckbar = (mesg,icon)=>{
  Swal.fire({
    title:mesg,
    icon:icon,
    timer:2500
  })
}

const objtoarr= (obj)=>{
  let arr  =[]

  for (const key in obj) {    
    arr.unshift({...obj[key],id:key}) 
  }
  return arr
}

const Base_Url = "https://fetch-api-for-firebase-default-rtdb.asia-southeast1.firebasedatabase.app/"
const Movies_Url= `${Base_Url}/movies.json`;

const makeapicall = async (apiurl,methodName,body=null)=>{
  spiner.classList.remove("d-none")
  let mesgbody = body ? JSON.stringify(body) : null

  let CONFIG_OBJ ={
    method:methodName,
    body:mesgbody,
    headers: {
  "auth": "jwt token from ls",
  "Content-Type": "application/json"
}
  }
 try{
   
     let res= await  fetch(apiurl,CONFIG_OBJ)
    if(!res.ok){
      throw new Error("Network error")
    }
    
    return await res.json()
  }
 catch{
sanckbar("error","error")
 }
 finally{
   spiner.classList.add("d-none")
 }
  
}

let fetchData =async ()=>{
   let res = await makeapicall(Movies_Url,"GET",null)

     let newarr= objtoarr(res)
     moviecardtemplating(newarr)
     sanckbar("movies are fetched successfuy","success")
}

let moviecardtemplating= ele=>{
 let result=""
  ele.forEach(to=>{
    result+=`
     <div class="col-sm-3 mb-5">
    <div class="card moviecard h-100" id="${to.id}">
            <div class="card-header pb-0">
              <h2 class="m-0">${to. movieName}</h2>
            </div>
            <div class="card-body body">
              <figure class="mb-0">
                <img
                  src="${to.imgUrl}"
                  alt="${to.movieName}"
                  title="${to.movieName}"
                />
                 <figcaption>
                <p>
                <h3>${to.movieName}</h3>
                 ${to.description}
                </p>
              </figcaption>
              </figure>
             
            </div>
            <div class="card-footer d-flex justify-content-between">
              <button onclick="onEdit(this)" class="btn btn-success">Edit</button>
              <button onclick="onRemove(this)" class="btn btn-danger">Remove</button>
            </div>
          </div>
        </div>`
  })

  moviecardtemplte.innerHTML=result;
}
fetchData()

const createmoivecard = (res)=>{
  let col= document.createElement("div")
  col.classList =`col-sm-3 mb-5`;
  col.innerHTML = `
      <div class="card moviecard h-100" id="${res.id}">
            <div class="card-header pb-0">
              <h2 class="m-0">${res.movieName}</h2>
            </div>
            <div class="card-body body">
              <figure class="mb-0">
                <img
                  src="${res.imgUrl}"
                  alt="${res.movieName}"
                  title="${res.movieName}"
                />
                 <figcaption>
                <p>
                <h3>${res.movieName}</h3>
                 ${res.description}
                </p>
              </figcaption>
              </figure>
             
            </div>
            <div class="card-footer d-flex justify-content-between">
              <button onclick="onEdit(this)" class="btn btn-success">Edit</button>
              <button onclick="onRemove(this)" class="btn btn-danger">Remove</button>
            </div>
          </div>
  `
  moviecardtemplte.prepend(col)
}

const onMovieAdd =async (eve)=>{
  eve.preventDefault()

  let movies_obj={
    movieName:movienamecontrol.value,
    description:moviedescriptioncontrol.value,
    imgUrl:movieimgcontrol.value
  }
  movieForm.reset()
  let data=await makeapicall(Movies_Url,"POST",movies_obj)
  cl(data)
  createmoivecard({...movies_obj,id:data.name})
  onHideModel()
  sanckbar(`${movies_obj.movieName} is added`,"success")
}


const onEdit= async (ele)=>{
  let Edit_id = ele.closest(".card").id
  localStorage.setItem("Edit_id",Edit_id)
  let Edit_url =`${Base_Url}/movies/${Edit_id}.json`
 let res =await makeapicall(Edit_url,"GET",null)
 movienamecontrol.value = res.movieName;
 moviedescriptioncontrol.value = res.description;
 movieimgcontrol.value = res.imgUrl;
    onModelShow()
 movieaddbtn.classList.add("d-none")
movieUpdatedbtn.classList.remove("d-none") 

 window.scrollTo({ top: 0, behavior: "smooth" });
}

const onmovieUpdate =async (ele)=>{
  let Update_id = localStorage.getItem("Edit_id")
  let Update_url =  `${Base_Url}/movies/${Update_id}.json`

  let Updateobj= {
    movieName:movienamecontrol.value,
    description:moviedescriptioncontrol.value,
    imgUrl:movieimgcontrol.value,
    id:Update_id
  }

 let data = await makeapicall(Update_url,"PATCH",Updateobj)

 let card = document.getElementById(Update_id)

  card.querySelector(".card-header h2").innerHTML = data.movieName
  card.querySelector(".card-body img").src = data.imgUrl
  card.querySelector(".card-body img").alt = data.movieName
  card.querySelector(".card-body img").title = data.movieName
  card.querySelector(".card-body h3").innerHTML = data.movieName
  card.querySelector(".card-body p").innerHTML = data.description
 onHideModel()
   movieaddbtn.classList.remove("d-none")
movieUpdatedbtn.classList.add("d-none") 
  sanckbar(`${Updateobj.movieName} is updated`,"success")

  
  let updatedCard = document.getElementById(Update_id);
  if (updatedCard) {
    updatedCard.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}


const onRemove = async (ele) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be to remove this movie !!!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  });
  if (result.isConfirmed) {
    let Remove_id = ele.closest(".card").id;
    let Remove_url = `${Base_Url}/movies/${Remove_id}.json`;

      let robj = await makeapicall(Remove_url, "DELETE", null);
      cl(robj);
      ele.closest('.col-sm-3').remove();

      await Swal.fire({
        title: "Deleted!",
        text: "Your movie has been deleted.",
        icon: "success"
      });
  }
};


const onModelShow=eve=>{
   backDrop.classList.add("active")
   moviemodel.classList.add("active")
}
const onHideModel=eve=>{
      backDrop.classList.remove("active")
   moviemodel.classList.remove("active")

   movieForm.reset();
    movieaddbtn.classList.remove("d-none");
  movieUpdatedbtn.classList.add("d-none");
}



showmodelbtn.addEventListener("click",onModelShow)

closemoviemodelbtn.forEach(ele=>{
    ele.addEventListener("click",onHideModel)
})

movieForm.addEventListener("submit", onMovieAdd)
movieUpdatedbtn.addEventListener("click", onmovieUpdate)

