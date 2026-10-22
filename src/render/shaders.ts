// GLSL ES 1.00 (accepted by WebGL2). Both stages must use the same dialect to link.

export const RECT_VERTEX_SHADER = `
 // Vertex Shaders (GLSL)
 // Input: (x, y) in pixels
attribute vec2 a_pixel_position;
// Input: (320.0, 180.0)
uniform vec2 u_canvas_size;

void main() {
    // Conversion of  0..size to 0.0..2.0
    vec2 zero_to_two = (a_pixel_position / u_canvas_size) * 2.0;

    // Shift x and flip and shift y
    vec2 clip_space = vec2(zero_to_two.x - 1.0, 1.0 - zero_to_two.y);

    gl_Position = vec4(clip_space, 0.0, 1.0);
}
`;

export const RECT_FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`;
