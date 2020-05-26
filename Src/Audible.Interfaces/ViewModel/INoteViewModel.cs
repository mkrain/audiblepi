using System.Collections.Generic;

using Audible.Interfaces.Provider;

namespace Audible.Interfaces.ViewModel
{
    public interface INoteViewModel
    {
        IEnumerable<Note> Notes { get; }
    }
}