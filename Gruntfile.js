module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
	      files: 'sass/**/*.scss', // 1
	      tasks: [ 'sass', 'cssmin' ]
	    },

		sass: {
			dist: {
				options: {
			      style: 'expanded',
			      lineNumbers: true, // 1
			      sourcemap: 'none'
			    },
			    files: [{
			      expand: true, // 2
			      cwd: 'sass',
			      src: [ '**/*.scss' ],
			      dest: 'css',
			      ext: '.css'
			    }]
			}
		},

		cssmin: {
		  target: {
		    files: [{
		      expand: true,
		      cwd: 'css/',
		      src: ['*.css', '!*.min.css'],
		      dest: 'css/',
		      ext: '.min.css'
		    }]
		  }
		}

	});

	//Load watch task
	grunt.loadNpmTasks('grunt-contrib-watch');

	//Load the sass task
	grunt.loadNpmTasks('grunt-contrib-sass');

	//Load css minifier
	grunt.loadNpmTasks('grunt-contrib-cssmin');
};