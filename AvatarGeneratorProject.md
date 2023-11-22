# AvatarGenerator Project
## Objective
Project was build around decentraland, trying to bring a solution to sell NFTs of wearables for this platform.
The idea was create this platform that allows user upload decentraland wearables, watch them live on our platform and allow minting this wearables for NFTs though an IFrame implementation.

## So Far
We created a solution that can take different wearables (features) of an avatar and interchange between those building different avatars with multiple combinations of wearables (features).

Along the way we noticed how accessible this solution was aligning to any kind of visual style, this brought us a way to create what we call campaigns which the user creates with a base mesh (avatar base) with separation of parts (features) that are interchangeable forming different avatars as well as being an avatar any representation the user want the campaign to be.

We added extra configuration and options for a better user experience:
- Ways to change color for features, accessories and skin of the avatar.
- Ways to change cameras on selecting the feature to change as well as changing animations on the fly.
- Admin page where our user can upload new features as convenient.
- User can create new lights, stages and environment maps for the campaign.
- Collection mode that generates any combination possible of the selected campaign.
- An API with access to the list of features, accessories, options of any campaign.
- When the user is done with certain combination of avatar they can export it as a GLB or VRM file.

## Future
Right now the project is still missing multiple things that would make it an amazing product.
The work must continue.

Here are some changes that may be of use:
- Need more verifications when any user is creating a new campaign that maybe by name collides with existing ones (the next 2 changes sort of solve this issue).
- Add way to have a uid for campaigns and any name underneath, but associate the uid's to the user.
- Add a way to relate campaigns to users on storage, that way new campaigns with same name won't collide.


Here is a list of possible addons that would be amazing to have:
- We can add [KalidoFace-3d](https://github.com/yeemachine/kalidoface-3d) so we can show the user VRM features on our own viewer.
- There is a need for having less draw calls so we need to mix as many as possible textures we can, here is maybe an useful [example](https://github.com/shrekshao/gltf-avatar-threejs/blob/master/tools/gltf-avatar-merge.js#L343).
- Right now when we change features or export the avatar, the canvas sort of janks the browser, maybe by implementing [offscreen canvas](https://threejs.org/examples/#webgl_worker_offscreencanvas) we can solve this problem.
- We implemented VRM [v0.0](https://github.com/vrm-c/vrm-specification/tree/master/specification/0.0) but right now there is a [v1.0](https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_vrm-1.0) that would be a must.
- Changing animations on the fly is still missing as well, here an [example](https://threejs.org/examples/?q=animation#webgl_animation_skinning_blending).

This is an amazing project and even though is still missing some features it has great potential.

## Thanks
To the company MGH (TheHub) (HubStudios) for inviting and allowing us to create this project, it was an adventure filled with emotions, sweat and fun.
To our clients for believing in a product that fulfilled their needs.

To the team:
- Camilo Castro
- Camilo Molina
- Jhon Sandoval
- Oswaldo Mantilla

For giving everything and making it better with every change we did.

To you for reading this document.

Have fun!