
using System;

namespace Audible.Interfaces.Provider
{
    public class CalculatingPiEventArgs : EventArgs
    {
        public int CurrentDigit { get; set; }

        public CalculatingPiEventArgs()
        {
        }
    }
}