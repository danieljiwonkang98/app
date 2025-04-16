import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base configuration for all environments
const common = {
  // Enable source maps for debugging
  devtool: 'source-map',

  // Resolve these extensions
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css'],
    alias: {
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@services': path.resolve(__dirname, 'src/renderer/services'),
      '@utils': path.resolve(__dirname, 'src/renderer/utils'),
      '@styles': path.resolve(__dirname, 'src/renderer/styles'),
      '@assets': path.resolve(__dirname, 'src/renderer/assets'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },

  // Module rules for different file types
  module: {
    rules: [
      // JavaScript/JSX files
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      // CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // SCSS/SASS files
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // Image files
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      // Font files
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
};

// Main process configuration
const mainConfig = {
  ...common,
  entry: './src/main/index.js',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
};

// Renderer process configuration
const rendererConfig = {
  ...common,
  entry: './src/renderer/index.js',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/renderer/index.html'),
    }),
  ],
};

// Export configurations based on environment
export default [mainConfig, rendererConfig];
