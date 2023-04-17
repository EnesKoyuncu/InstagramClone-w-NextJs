import React from 'react'
import {
    BookmarkIcon,
    ChatIcon,
    DotsHorizontalIcon,
    EmojiHappyIcon,
    HeartIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/outline";

import { 
    collection,
    serverTimestamp, 
    addDoc, 
    onSnapshot, 
    orderBy, 
    query 
} from 'firebase/firestore';

import { HeartIcon as HeartIconFileed } from "@heroicons/react/solid";
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import { db } from '../firebase';
import trim from "trim";


function Post({id , username, userImg, img, caption}) {

    const {data : session } = useSession();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    console.log(typeof(comment));
    console.log(comment);
    useEffect(
        () => onSnapshot(
            query(collection(db,'posts', id , 'comments'),
             orderBy('timestamp', 'desc')
             ),
              (snapshot) => setComment(snapshot.docs)
              ),
            [db]
        )


    const sendComment = async (e) => {
        e.preventDefault();

        const commentToSend = comment;
        setComment("");

        await addDoc(collection(db, 'posts', id,
         "comments"), {
            comment : commentToSend,
            username : session.user.username,
            userImage : session.user.image,
            timestamp : serverTimestamp(),
        });
    };

    const getComment = () => {
        return comment; 
    };
  return (
    <div className='bg-white my-7 border rounded-sm'>

        {/* Header */}
        <div className='flex items-center p-5'>
            <img className='rounded-full h-12 w-12 object-contain border p-1 mr-3' src={userImg} alt='' />
            <p className='flex-1 font-bold'>{username}</p>
            <DotsHorizontalIcon className='h-5' />
        </div>
        {/* Img */}
        <img className='object-cover 
        w-full' src={img} alt='' />

        {/* Buttons */}
        {session && (
             <div className='flex justify-between px-4 pt-4'>
            <div className='flex space-x-4'>
                <HeartIcon className='btn' />
                <ChatIcon className='btn' />
                <PaperAirplaneIcon className='btn' />
            </div>

            <BookmarkIcon className='btn'/>
        </div>
        )}
       
        {/* caption */}
        <p className='p-5 truncate'>
            <span className='font-bold mr-1'>{username}</span>
            {caption}
        </p>

        {/* comments */}
        

        {/* input box  */}
        {session && (
             <form className='flex items-center p-4'>
            <EmojiHappyIcon className="h-7"/>
            <input 
                type="text" 
                value={comment}
                onChange = {(e) => setComment(e.target.value)}
                placeholder='Add a comment...'
                className='border-none flex-1 focus:ring-0 outline-none'
            />
            <button 
            type="submit" 
            disabled = {!comment} 
            onClick = {sendComment}
            className='font-semibold text-blue-400'
            >
            Post
            </button>
        </form>
        )}
       
    </div>
  )
}

export default Post