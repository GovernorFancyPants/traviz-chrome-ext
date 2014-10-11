module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        compass: {
            dist: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'build',
                    outputStyle: 'expanded'
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 version']
            },
            multiple_files: {
                expand: true,
                flatten: true,
                src: 'scss/*.css',
                dest: 'build'
            }
        },

        cssmin: {
            combine: {
                options: {
                    keepSpecialComments: 0
                },
                files: {
                    'build/global.css': ['build/global.css']
                }
            }
        },

        jshint: {
            beforeconcat: ['js/*.js']
        },

        concat: {
            dist: {
                options: {
                    sourceMap: true,
                },
                src: [
                    'js/traviz.js'
                ],
                dest: 'build/traviz.min.js',
            }
        },

        uglify: {
            options: {
                //sourceMap: true,
                //sourceMapIncludeSources: true,
                //sourceMapIn: 'js/build/production.js',
            },
            build: {
                src: 'build/traviz.min.js',
                dest: 'build/traviz.min.js'
            },
            extras: {
                src: 'js/popup.js',
                dest: 'build/popup.js'
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'build/'
                }]
            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['manifest.json', 'popup.html', 'js/background.js'],
                        dest: 'build/',
                        filter: 'isFile'
                    }
                ]
            }
        },

        compress: {
            main: {
                options: {
                    archive: function() {
                        return 'build/package/traviz.zip';
                    }
                },
                files: [
                    {
                        flatten: true,
                        expand: true,
                        cwd: 'build/',
                        src: ['**'],
                        dest: '/',
                        filter: 'isFile'
                    }
                ]
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            html: {
                files: ['popup.html'],
                options: {
                    spawn: false,
                }
            },
            scripts: {
                files: ['js/*.js'],
                tasks: ['concat', 'uglify', 'jshint'],
                options: {
                    spawn: false,
                }
            },
            css: {
                files: ['scss/**/*.scss'],
                tasks: ['compass', 'autoprefixer', 'cssmin'],
                options: {
                    spawn: false,
                }
            },
            images: {
                files: ['img/**/*.{png,jpg,gif}', 'img/*.{png,jpg,gif}'],
                tasks: ['imagemin'],
                options: {
                    spawn: false,
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 8000,
                    base: './'
                }
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    // Default Task is basically a rebuild
    grunt.registerTask('default', ['concat', 'uglify', 'compass', 'autoprefixer', 'cssmin', 'imagemin', 'copy', 'compress']);

    grunt.registerTask('debug', ['compass', 'autoprefixer']);

    grunt.registerTask('dev', ['connect', 'watch']);

};