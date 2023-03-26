import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

//console.log('Let\'s go!');

//===============================================================================//
//                              HELPER FUNCTIONS
//===============================================================================//

//apiCall directly contacts the database to make changes or read existing data
//This function takes in 4 inputs: path, method, payload, success
//Path: takes in path (first '/' is not required)
//Method: GET, POST, PUT, DELETE
//Payload: The request body
//Success: Function that gets executed after a successful apiCall
const apiCall = (path, method, payload, success) => {
    const options = {
        method: method,
        headers: {
            'Content-type': 'application/json',
        },
    };

    if (method === 'GET') {
    } else {
        options.body = JSON.stringify(payload)
    }

    if(localStorage.getItem('token')) {
        options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    return fetch('http://localhost:5005/' + path, options)
        .then((response) => {
            return response.json()
                .then((data) => {
                    if(data.error) {
                        alert(data.error);
                    } else {
                        if(success) {
                            return success(data);
                        }
                    }
                });
        });
}

//Creates an element of a specific type with a specific text and appends it
const elementFactory = (type, text, appendTo) => {
    const element = document.createElement(type);
    element.innerText = text;
    if (typeof appendTo === 'string') {
        document.getElementById(appendTo).appendChild(element);
    } else {
        appendTo.appendChild(element);
    }
}

//Makes an apiCall to get the username, given a userId
function getName(userId) {
    return apiCall('user?userId='+userId, 'GET', {}, (data) => {
        //console.log(data.name);
        return data.name;
    });
}

//Makes an apiCall to get the email, given a userId
function getEmail(userId) {
    return apiCall('user?userId='+userId, 'GET', {}, (data) => {
        //console.log(data.name);
        return data.email;
    });
}

//Shows an element in frontend
const show = (element) => {
    document.getElementById(element).classList.remove('hide');
}

//Hides an element in frontend
const hide = (element) => {
    document.getElementById(element).classList.add('hide');
}

//===============================================================================//
//                              EVENT FUNCTIONS
//===============================================================================//

//Function for 'profile-button'
document.getElementById("profile-button").addEventListener('click', ()=> {
    show('home-button');
    hide('profile-button');
    
    show('profile-page');
    hide('home-page');
    
    populateProfile(localStorage.getItem('userId'));
})

//Function for 'home-button'
document.getElementById("home-button").addEventListener('click', ()=> {
    show('profile-button');
    hide('home-button');
    
    show('home-page');
    hide('profile-page');
    
    populateFeed();
})

//Function for 'create-fake-job'
//!!! FOR TESTING PURPOSES ONLY !!!
/*document.getElementById('create-fake-job').addEventListener('click', () => {
    const payload = {
        "title": "COO for cupcake factory",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        "start": "2011-10-05T14:48:00.000Z",
        "description": "Dedicated technical wizard with a passion and interest in human relationships"
    }
    apiCall('job', 'POST', payload);
});*/

//Function for register-button
//Checks if the password and confirm password is the same
//If both is the same, do apiCall
document.getElementById('register-button').addEventListener('click', () => {
    const registerPassword = document.getElementById('register-password').value;
    const registerCPassword = document.getElementById('register-cpassword').value;

    if (registerPassword != registerCPassword) {
        alert('Password Invalid')
    } else {
        const payload = {
            email: document.getElementById('register-email').value,
            name: document.getElementById('register-name').value,
            password: document.getElementById('register-password').value
        }
    
        apiCall('auth/register', 'POST', payload, (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            show('section-logged-in');
            hide('section-logged-out');
            show('nav-logged-in');
            hide('nav-logged-out');
            populateFeed();
        });
    }
});

//Function for 'login-button'
document.getElementById('login-button').addEventListener('click', () => {
    const payload = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    }

    apiCall('auth/login', 'POST', payload, (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        show('section-logged-in');
        show('nav-logged-in');
        hide('section-logged-out');
        hide('nav-logged-out');
        populateFeed();
    });
});

//Function for 'nav-register'
document.getElementById('nav-register').addEventListener('click', () => {
    show('page-register');
    hide('page-login');
});

//Function for 'nav-login'
document.getElementById('nav-login').addEventListener('click', () => {
    show('page-login');
    hide('page-register');
});

//Function for 'logout-button'
document.getElementById('logout-button').addEventListener('click', () => {
    show('section-logged-out');
    hide('section-logged-in');
    show('nav-logged-out');
    hide('nav-logged-in');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
});

//Function for 'search-watch-button'
//Creates a popup that takes an input (Email)
//Searches for that user in the database, if user exists, logged in user watches the searched user
document.getElementById('search-watch-button').addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.height = "130px"

    const popupClose = document.createElement('button');
    popupClose.id = 'popup-close-button';
    popupClose.innerHTML = '&#x2715';
    popupClose.addEventListener('click', () => {
        popup.remove();
    });
    popup.appendChild(popupClose);
    
    elementFactory('h2', 'Search Watch', popup);

    const inputEmail = document.createElement('input');
    inputEmail.placeholder = 'Email Adress';
    popup.appendChild(inputEmail);

    const watchButton = document.createElement('button');
    watchButton.className = 'watch-button'
    watchButton.innerHTML = 'Watch';
    popup.appendChild(watchButton);

    watchButton.addEventListener('click', ()=> {
        const payload = {
            email: inputEmail.value,
            turnon: true
        }
        apiCall('user/watch', 'PUT', payload);
    });

    document.getElementById('section-logged-in').appendChild(popup);
});

//Function for 'create-job-button'
//Creates a popup to enter details of a new Job
document.getElementById('create-job-button').addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.height = "130px"

    const popupClose = document.createElement('button');
    popupClose.id = 'popup-close-button';
    popupClose.innerHTML = '&#x2715';
    popupClose.addEventListener('click', () => {
        popup.remove();
    });
    popup.appendChild(popupClose);

    //INPUTS
    const inputTitle = document.createElement('input');
    inputTitle.placeholder = 'Title';
    popup.appendChild(inputTitle);

    const inputStart = document.createElement('input');
    inputStart.type='date';
    inputStart.placeholder = 'Starting Date';
    popup.appendChild(inputStart);

    const inputDescription = document.createElement('input');
    inputDescription.placeholder = 'Job Description';
    popup.appendChild(inputDescription);

    const inputImage = document.createElement('input');
    inputImage.type = "file";
    popup.appendChild(inputImage);

    const createJobEnterButton = document.createElement('button');
    createJobEnterButton.innerHTML = 'Create Job';
    popup.append(createJobEnterButton);
    createJobEnterButton.addEventListener('click', () =>{
        const payload = {
            "title": inputTitle.value,
            "image": null,
            "start": inputStart.value,
            "description": inputDescription.value
        }
        apiCall('job', 'POST', payload);
    });

    document.getElementById('section-logged-in').appendChild(popup);
});

//===============================================================================//
//                              MAIN FUNCTIONS
//===============================================================================//

//Switches the page to the profile page of a specific user, given the userId
//The page includes: UserName, Edit Profile/Watch Button, Jobs created by the user, Number of followers, Followers List
//Edit Profile Button will be displayed when the profile matches the logged in user
//Watch Button will be displayed when the profile is not the logged in user
const populateProfile = (userId) => {
    apiCall('user?userId='+userId, 'GET', {}, (data) => {
        document.getElementById('profile-page').textContent = '';
        
        elementFactory('h2', data.name, 'profile-page');
        
        if(userId != localStorage.getItem('userId')) {
            const watchButton = document.createElement('button');
            watchButton.innerText = 'Watch';
            watchButton.addEventListener('click', () => {
                const userEmail = getEmail(userId);
                userEmail.then(email => {
                    const payload = {
                        email: email,
                        turnon: true
                    }

                    apiCall('user/watch', 'PUT', payload, (data) => {
                        //console.log('Success')
                    })
                });                
            })
            document.getElementById('profile-page').appendChild(watchButton);  
        } else {
            const editProfileButton = document.createElement('button');
            editProfileButton.innerText = 'Edit Profile';
            editProfileButton.addEventListener('click', () => {  
                const popup = document.createElement('div');
                popup.className = 'popup';
                //popup.style.height = "130px"
            
                const popupClose = document.createElement('button');
                popupClose.id = 'popup-close-button';
                popupClose.innerHTML = '&#x2715';
                popupClose.addEventListener('click', () => {
                    popup.remove();
                });
                popup.appendChild(popupClose);
                
                elementFactory('h2', 'Edit Profile', popup);
                
                //INPUTS
                const inputEmail = document.createElement('input');
                inputEmail.placeholder = 'Email Adress';
                popup.appendChild(inputEmail);

                const inputPassword = document.createElement('input');
                inputPassword.placeholder = 'Password';
                popup.appendChild(inputPassword);

                const inputName = document.createElement('input');
                inputName.placeholder = 'Full Name';
                popup.appendChild(inputName);

                const editProfileEnterButton = document.createElement('button');
                editProfileEnterButton.innerHTML = 'Save Changes';
                popup.appendChild(editProfileEnterButton);

                editProfileEnterButton.addEventListener('click', () => {
                    const payload = {
                        email: inputEmail.value,
                        password: inputPassword.value,
                        name: inputName.value,
                        img: undefined
                    }

                    apiCall('user', 'PUT', payload, (data) => {
                        console.log('Success')
                    })
                })

                document.getElementById('section-logged-in').appendChild(popup);
            })
            document.getElementById('profile-page').appendChild(editProfileButton);  
        }

        elementFactory('div', data.email, 'profile-page');        
        
        createFeedBlock(data.jobs, 'profile-page')

        elementFactory('h2', 'Followers:' + data.watcheeUserIds.length, 'profile-page');
        
        data.watcheeUserIds.forEach(element => {
            const watchee = document.createElement('div');
            const watcheeName = getName(element);
            watcheeName.then(name => watchee.innerText = name);
            //console.log(getName(element))
            document.getElementById('profile-page').appendChild(watchee);        
        });

    });
}

//Creates a FeedBlock (A block to display a certain job), given the data and destination
//Data: information stored in the backend
//Destinaiton: where the feedBlock will be appended to (takes in an element id)
//This will display: Photo Image, Like Button, Comment Button, Title, Name, PostedDate, Start Date, Likes, Comment, *Edit button, *Delete button
//Edit and Delete button will only be displayed if the job is created by the logged in user
const createFeedBlock = (data, destination) => {
    for (const feedItem of data) {
        //Base of feedblock
        const feedBlock = document.createElement('div');
        feedBlock.className = "feedBlock"
        document.getElementById(destination).appendChild(feedBlock);

        //FeedBlockLeft
        //This includes : Photo Image, Like Button, Comment Button
        const feedBlockLeft = document.createElement('div');
        feedBlockLeft.className = "feedBlockLeft"
        feedBlock.appendChild(feedBlockLeft);

        //Post Image
        const feedImage = document.createElement('img');
        feedImage.className = 'feed-image';
        feedImage.src = feedItem.image;
        feedBlockLeft.appendChild(feedImage);

        //Post Like Button
        const likeButton = document.createElement('button');
        likeButton.className = 'like-button';
        likeButton.innerHTML = '♡'
        likeButton.addEventListener('click', () => {
            const payload = {
                id: feedItem.id,
                turnon: true
            }

            apiCall('job/like', 'PUT', payload, (data) => {
                //console.log('success')
            });
        });
        feedBlockLeft.appendChild(likeButton);

        //Post Comment Button
        const commentButton = document.createElement('button');
        commentButton.className = 'comment-button';
        commentButton.innerHTML = '⌧';
        commentButton.addEventListener('click', ()=> {
            const popup = document.createElement('div');
            popup.className = 'popup';
            //popup.style.height = "130px"
        
            const popupClose = document.createElement('button');
            popupClose.id = 'popup-close-button';
            popupClose.innerHTML = '&#x2715';
            popupClose.addEventListener('click', () => {
                popup.remove();
            });
            popup.appendChild(popupClose);

            elementFactory('h2', 'Leave a Comment', popup);

            const inputComment = document.createElement('input');
            inputComment.placeholder = 'Comment';
            popup.appendChild(inputComment);

            const commentEnterButton = document.createElement('button');
            commentEnterButton.innerHTML = "Post Comment"
            commentEnterButton.addEventListener('click', () => {
                const payload = {
                    "id": feedItem.id,
                    "comment": inputComment.value
                }

                apiCall('job/comment', 'POST', payload);
            });
            popup.appendChild(commentEnterButton);

            document.getElementById('section-logged-in').append(popup);
        });
        feedBlockLeft.appendChild(commentButton);

        //FeedBlockRight
        //This includes : Title, Name, PostedDate, Start Date, Likes, Comment, Edit button
        const feedBlockRight = document.createElement('div');
        feedBlockRight.className = "feedBlockRight"
        feedBlock.appendChild(feedBlockRight);

        //Post Title
        elementFactory('div', feedItem.title, feedBlockRight);

        //Post Name (Clickable To Profile)
        const feedName = document.createElement('div');
        feedName.classList.add('clickable')
        const userName = getName(feedItem.creatorId);
        userName.then(name => feedName.innerText = name);
        feedName.addEventListener('click', () => {
            show('home-button');
            hide('profile-button');
    
            show('profile-page');
            hide('home-page');

            populateProfile(feedItem.creatorId);
        });
        feedBlockRight.appendChild(feedName);

        //Post Posted Date
        const feedPostDate = document.createElement('div');
        const createdDate = new Date(feedItem.createdAt)
        const timeDiff = Date.now() - createdDate;
        //const dayDiff = Math.floor(timeDiff / (1000 * 3600 *24));
        if (timeDiff > 86400000) {
            feedPostDate.innerText = "Posted on " + createdDate.getDate() + "/" + createdDate.getMonth() + "/" + createdDate.getFullYear();
        } else {
            const HourDiff = Math.floor(timeDiff / 3600000);
            const MinuteDiff = Math.floor((timeDiff - HourDiff * 3600000) / 60000);
            feedPostDate.innerText = "Posted " + HourDiff + " hours " +  MinuteDiff + " minutes ago";
        }
        feedBlockRight.appendChild(feedPostDate);
        
        //Post Start Date
        const startDate = new Date(feedItem.start);
        elementFactory('div', "Start: " + startDate.getDate() + "/" + startDate.getMonth() + "/" + startDate.getFullYear(), feedBlockRight);

        //Post Likes
        const feedLikes = document.createElement('div');
        feedLikes.classList.add('clickable');
        feedLikes.addEventListener('click', () => {
            createPopup(feedItem.likes, 'Likes');
        });
        feedLikes.innerText = "Likes: " + feedItem.likes.length;
        feedBlockRight.appendChild(feedLikes);

        //Post Comments
        const feedComments = document.createElement('div');
        feedComments.classList.add('clickable');
        feedComments.addEventListener('click', () => {
            createPopup(feedItem.comments, 'Comments');
        });
        feedComments.innerText = "Comments: " + feedItem.comments.length;
        feedBlockRight.appendChild(feedComments);

        if(feedItem.creatorId == localStorage.getItem('userId')) {
            //EDIT POST
            const editPostButton = document.createElement('button');
            editPostButton.innerHTML = "Edit Post";
            editPostButton.addEventListener('click', () => {
                const popup = document.createElement('div');
                popup.className = 'popup';
                popup.style.height = "130px"

                const popupClose = document.createElement('button');
                popupClose.id = 'popup-close-button';
                popupClose.innerHTML = '&#x2715';
                popupClose.addEventListener('click', () => {
                    popup.remove();
                });
                popup.appendChild(popupClose);

                //INPUTS
                const inputTitle = document.createElement('input');
                inputTitle.placeholder = 'Title';
                popup.appendChild(inputTitle);

                const inputStart = document.createElement('input');
                inputStart.type='date';
                inputStart.placeholder = 'Starting Date';
                popup.appendChild(inputStart);

                const inputDescription = document.createElement('input');
                inputDescription.placeholder = 'Job Description';
                popup.appendChild(inputDescription);

                const inputImage = document.createElement('input');
                inputImage.type = "file";
                popup.appendChild(inputImage);

                const createJobEnterButton = document.createElement('button');
                createJobEnterButton.innerHTML = 'Save Changes';
                popup.append(createJobEnterButton);
                createJobEnterButton.addEventListener('click', () =>{
                    const payload = {
                        "id": feedItem.id,
                        "title": inputTitle.value,
                        "image": null,
                        "start": inputStart.value,
                        "description": inputDescription.value
                    }
                    apiCall('job', 'PUT', payload);
                });

                document.getElementById('section-logged-in').appendChild(popup);
            });
            feedBlockRight.appendChild(editPostButton);

            //DELETE POST
            const deletePostButton = document.createElement('button');
            deletePostButton.innerHTML = "Delete Post";
            deletePostButton.addEventListener('click', () => {
                const payload = {
                    "id": feedItem.id
                }
                apiCall('job', 'DELETE', payload);
            });
            feedBlockRight.appendChild(deletePostButton);
        }
    }
}

//Populates the home page with all jobs in the database
const populateFeed = () => {
    apiCall('job/feed?start=0', 'GET', {}, (data) => {
        document.getElementById('feed-items').textContent = '';
        createFeedBlock(data, 'feed-items')
    });
}

//Creates a popup for likes and comments, given the list of user 
//type has two options: like OR comment
const createPopup = (list, type) => {
    const popup = document.createElement('div');
    popup.className = 'popup';

    elementFactory('h3', type, popup);

    const popupClose = document.createElement('button');
    popupClose.id = 'popup-close-button';
    popupClose.innerHTML = '&#x2715';
    popupClose.addEventListener('click', () => {
        popup.remove();
    });
    popup.appendChild (popupClose);

    list.forEach(element => {
        const user = document.createElement('div');
        user.className = 'user';
        //console.log(element);
        user.innerHTML = element.userName;

        if (type == 'Comments') {
            const comment = document.createElement('div');
            comment.innerHTML = element.comment;
            user.appendChild(comment);
            //console.log(comment)
        }

        popup.appendChild(user);
    });

    document.getElementById('section-logged-in').appendChild(popup);
}

//===============================================================================//
//                              ON STARTUP
//===============================================================================//

//Checks if user is logged in before
if(localStorage.getItem('token')) {
    show('section-logged-in');
    hide('section-logged-out');
    show('nav-logged-in');
    hide('nav-logged-out');
    populateFeed();
    //console.log(localStorage.getItem('token'));
}