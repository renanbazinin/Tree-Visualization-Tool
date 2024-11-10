# Tree Visualization from Text Input

This project is a JavaScript-based tree visualizer that parses text input in the form of list representations (e.g., `(nil nil)` or `((nil.nil) nil)`) and generates a visual representation of the tree structure on a canvas. The visualizer supports mixed and list modes and highlights input validity in real-time as you type.

## Features

- Parses text input into a binary tree structure.
- Supports both list representation `(nil nil nil)` and mixed representation `((nil.nil) nil)`.
- Provides a real-time validation indicator:
  - **Green** outline: Valid input.
  - **Orange** outline: Incomplete but correct input.
  - **Red** outline: Invalid input.
- Visualizes the tree structure with nodes and branches on a canvas.
- Dark mode styling with cool visuals.



## Screenshot

![Tree Visualization Screenshot](https://i.imgur.com/bytXu7N.png)

## Installation

1. Clone or download this repository.
2. Open `index.html` in a web browser.

## Usage

1. Enter your tree representation in the text input box using either dot or list notation.
2. Click the "Generate Tree" button to visualize the tree on the canvas below.
3. The text input will indicate validity in real-time as you type:
   - **Green** outline: Valid syntax.
   - **Orange** outline: Correct but incomplete input.
   - **Red** outline: Invalid syntax.

## Example Inputs

- List Mode: `(nil nil nil)`
- Dot Mode: `((nil.nil).nil)`
- Mixed Mode: `((nil.nil) nil)`

