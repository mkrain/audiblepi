using System;
using System.Collections;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;

using Audible.Interfaces.Provider;

namespace Audible.Provider
{
    public class PiStreamIterator : IPiIterator<string>
    {
        private long _currentIndex;
        private Stream _piStream;
        private string _fileName;
        private static readonly Assembly _assembly = Assembly.GetExecutingAssembly();
        private readonly byte[] _buffer = new byte[3];

        private string _previous;
        private string _current;
        private string _next;


        public PiStreamIterator(string fileName)
        {
            if( string.IsNullOrEmpty(fileName) )
                throw new ArgumentNullException("fileName");

            _fileName = fileName;

            _piStream = this.OpenStream(_fileName);

            _currentIndex = 0;
        }

        public PiStreamIterator() : this("1000000.12.txt")
        {
        }

        #region Implementation of IDisposable

        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if( !disposing )
                return;

            if( this._piStream != null )
            {
                this._piStream.Close();
            }

            this._piStream = null;
        }

        #endregion

        #region Implementation of IEnumerator

        public bool MoveNext()
        {
            _currentIndex++;

            if( _currentIndex > _piStream.Length - 1 )
            {
                _currentIndex = _piStream.Length - 1;
                return false;
            }

            return true;
        }

        public string Current
        {
            get { return _current; }
        }

        public void Reset()
        {
            _currentIndex = 0;
        }

        object IEnumerator.Current
        {
            get { return Current; }
        }

        #endregion

        #region IPiIterator

        public long Length { get { return _piStream == null ? 0 : _piStream.Length; }}

        public bool MovePrevious()
        {
            _currentIndex--;

            if( _currentIndex < 0 )
            {
                _currentIndex = 0;
                return false;
            }

            return true;
        }

        public string Previous
        {
            get { return _previous; }
        }

        public string Next
        {
            get { return _next; }
        }

        public int ReadBytes(byte[] buffer, int offset, int count)
        {
            AssertFileIsOpen();

            return _piStream.Read(buffer, offset, count);
        }

        /// <summary>
        /// 
        /// Sets the stream position to the offset which is
        /// 0 based, i.e. seek 10 sets the position to the 11th 
        /// byte.
        /// 
        /// </summary>
        /// <param name="offset">0 base position in the stream.</param>
        /// <param name="origin">SeekOrigin</param>
        /// <returns>Seek value</returns>
        public long Seek(long offset, SeekOrigin origin)
        {
            AssertFileIsOpen();

            if( offset > _piStream.Length )
                offset = _piStream.Length - 1;

            _currentIndex = offset;

            if( _currentIndex == 0 )
            {
                _piStream.Seek(0, SeekOrigin.Begin);
                var read = this.ReadBytes(_buffer, 0, 2);

                var converted = this.ConvertByteToString(_buffer, 2);

                _previous = string.Empty;
                _current = converted[0].ToString(CultureInfo.InvariantCulture);
                _next = converted[1].ToString(CultureInfo.InvariantCulture);

                _piStream.Seek(_currentIndex, SeekOrigin.Begin);
            }
            else if( _currentIndex == this.Length - 1 )
            {
                _piStream.Seek(0, SeekOrigin.Begin);
                var read = this.ReadBytes(_buffer, 0, 2);

                var converted = this.ConvertByteToString(_buffer, 2);

                _previous = converted[0].ToString(CultureInfo.InvariantCulture);
                _current = converted[1].ToString(CultureInfo.InvariantCulture);
                _next = string.Empty;

                _piStream.Seek(_currentIndex, SeekOrigin.Begin);
            }
            else if( _currentIndex > 0 || _currentIndex < this.Length - 2 )
            {
                _piStream.Seek(_currentIndex - 1, SeekOrigin.Begin);
                var read = this.ReadBytes(_buffer, 0, 3);

                var converted = this.ConvertByteToString(_buffer, 3);

                _previous = converted[0].ToString(CultureInfo.InvariantCulture);
                _current = converted[1].ToString(CultureInfo.InvariantCulture);
                _next = converted[2].ToString(CultureInfo.InvariantCulture);

                _piStream.Seek(_currentIndex, SeekOrigin.Begin);
            }

            return _currentIndex;
        }

        #endregion

        #region Private Methods

        private void AssertFileIsOpen()
        {
            if( _piStream == null )
                this.OpenReader(_fileName);            
        }

        private void OpenReader(string file)
        {
            if( string.IsNullOrEmpty(file) )
                return;
            
            if( _piStream != null )
            {
                _piStream.Close();
                _piStream = null;
            }

            _piStream = OpenStream(file);
            _fileName = file;
        }

        private Stream OpenStream(string fileName)
        {
            var resourceNames = _assembly.GetManifestResourceNames();

            var fileResource = resourceNames.FirstOrDefault(fn => fn.Contains(fileName));

            var stream = _assembly.GetManifestResourceStream(fileResource);

            return stream;
        }

        private string ConvertByteToString(byte[] buffer, int count)
        {
            return Encoding.UTF8.GetString(buffer, 0, count);
        }

        #endregion
    }
}