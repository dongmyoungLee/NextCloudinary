'use server';

import {storePost, updatePostLikeStatus} from "@/lib/posts";
import {redirect} from "next/navigation";
import {uploadImage} from "@/lib/cloudinary";
import {revalidatePath} from "next/cache";

export async function createPost(prevState, formData) {
    const title = formData.get('title');
    const image = formData.get('image');
    const content = formData.get('content');

    let errors = [];

    if (!title || title.trim().length === 0) {
        errors.push("Title is Required");
    }

    if (!content || content.trim().length === 0) {
        errors.push("Content is Required");
    }

    if (!image || image.size === 0) {
        errors.push("Image is Required");
    }

    if (errors.length > 0) {
        return { errors };
    }

    let imageUrl;

    try {
        imageUrl = await uploadImage(image);
    } catch (error) {
        throw Error('Image upload failed, post was not created.')
    }



    await storePost({
        imageUrl: imageUrl,
        title,
        content,
        userId: 1
    });

    revalidatePath('/', 'layout');
    redirect('/feed');
}

export async function togglePostLikeStatus(postId, formData) {
    await updatePostLikeStatus(postId, 2);
    // revalidatePath('/feed');

    // root 를 감싸는 layour 모두 재검증
    revalidatePath('/', 'layout');
}