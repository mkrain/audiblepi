using System.Collections.Generic;
using System.IO;

namespace Audible.Interfaces.Provider
{
    public interface IPiIterator<T> : IEnumerator<T>
    {
        T Previous { get;  }
        T Next { get;  }

        long Length { get; }

        bool MovePrevious();

        int ReadBytes(byte[] buffer, int offset, int count);

        long Seek(long offset, SeekOrigin origin);
    }
}