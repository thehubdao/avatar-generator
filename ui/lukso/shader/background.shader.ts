export const fragmentShaderSource = `
// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
vec2 center = vec2(0.,0.9);
float speed = 0.1;

float circle(in vec2 _st, in float _radius, in float _blur){
    vec2 dist = _st-vec2(1, 1);
	return 1.-smoothstep(_radius-(_radius*_blur),
                         _radius+(_radius*_blur),
                         dot(dist,dist)*4.0);
}

void main(){
    float invAr = u_resolution.y / u_resolution.x;

    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
		
    uv /= 2.0;
    
    float pct = 0.0;
    
    vec3 bg = vec3(0.98, 0.74, 0.88);
    //vec3 bg = vec3(0.0, 1.0, 1.0);
    
    // a. The DISTANCE from the pixel to the center
    // pct = distance(uv*2.0,vec2(1.));
    // vec3 light = vec3(abs(pct-1.))+0.5;
    vec3 light = vec3(circle(uv*2.0,6.9+abs(sin(u_time)),0.9)) * 1.0;
        
	vec3 col = vec4(uv,0.5+0.5*sin(u_time),1.0).xyz;
    vec3 texcol;
			
	float x = (center.x-uv.x);
	float y = (center.y-uv.y) *invAr;
    
	//float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
	float r = -(x*x + y*y);
	float z = 1.0 + 0.5*sin((r+u_time*speed)/0.013);
	
	texcol.x = z;
	texcol.y = z;
	texcol.z = z;
    
	vec3 color = mix(texcol, bg, 0.9);
    vec3 ripple = mix(color, light*bg, 0.6);
    
	gl_FragColor = vec4(mix(ripple, vec3(1.0), 0.3),1.0);
    //fragColor = vec4(light,1.0);
}
`;